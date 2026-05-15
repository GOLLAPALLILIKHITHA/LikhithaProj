const { Op } = require('sequelize');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const emailService = require('../services/emailService');

// Create a new service request
const createServiceRequest = async (req, res) => {
  try {
    const {
      serviceType,
      problemDescription,
      userPhone,
      userAddress
    } = req.body;

    // Validate required fields
    if (!serviceType || !problemDescription || !userPhone || !userAddress) {
      return res.status(400).json({ message: 'Service type, problem description, phone number, and address are required' });
    }

    // Create service request
    const serviceRequest = await ServiceRequest.create({
      userId: req.user.id,
      serviceType,
      problemDescription,
      userPhone,
      userAddress,
      status: 'pending'
    });

    // Send email notification to admin
    try {
      await emailService.sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Service Request - ${serviceType}`,
        html: `
          <h2>New Service Request</h2>
          <p><strong>Service Type:</strong> ${serviceType}</p>
          <p><strong>Customer:</strong> ${req.user.name}</p>
          <p><strong>Phone:</strong> ${userPhone}</p>
          <p><strong>Email:</strong> ${req.user.email}</p>
          <p><strong>Address:</strong> ${userAddress}</p>
          <br>
          <p><strong>Problem Description:</strong></p>
          <p>${problemDescription}</p>
          <br>
          <p>Please assign a worker from the admin panel.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }

    res.status(201).json({
      message: 'Service request submitted successfully',
      serviceRequest
    });
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({ message: 'Failed to create service request', error: error.message });
  }
};

// Get user's service requests
const getUserServiceRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(serviceRequests);
  } catch (error) {
    console.error('Get user service requests error:', error);
    res.status(500).json({ message: 'Failed to fetch service requests', error: error.message });
  }
};

// Admin: Get all service requests
const getAllServiceRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const serviceRequests = await ServiceRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
          where: search
            ? {
                [Op.or]: [
                  { name: { [Op.like]: `%${search}%` } },
                  { email: { [Op.like]: `%${search}%` } },
                  { phone: { [Op.like]: `%${search}%` } },
                ],
              }
            : undefined,
          required: !!search,
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'businessName', 'contactPerson', 'contactPhone', 'vendorType'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const total = await ServiceRequest.count({ where });

    res.json({
      serviceRequests,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get all service requests error:', error);
    res.status(500).json({ message: 'Failed to fetch service requests', error: error.message });
  }
};

// Admin: Assign vendor (preferred) or legacy worker by name/phone
const assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorId, workerName, workerPhone, adminNotes } = req.body;

    const serviceRequest = await ServiceRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    let vendor = null;
    if (vendorId) {
      vendor = await Vendor.findByPk(vendorId);
      if (!vendor || !vendor.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive vendor' });
      }
    }

    const effectiveWorkerName = vendor ? vendor.contactPerson : workerName;
    const effectiveWorkerPhone = vendor ? vendor.contactPhone : workerPhone;

    if (!effectiveWorkerName || !effectiveWorkerPhone) {
      return res.status(400).json({
        message: 'Select a registered vendor, or enter worker name and phone for a manual assignment.'
      });
    }

    await serviceRequest.update({
      status: 'assigned',
      vendorId: vendor ? vendor.id : null,
      assignedAt: new Date(),
      workerName: effectiveWorkerName,
      workerPhone: effectiveWorkerPhone,
      adminNotes: adminNotes !== undefined ? adminNotes : serviceRequest.adminNotes
    });

    const businessLine = vendor
      ? `<p><strong>Business:</strong> ${vendor.businessName}</p>`
      : '';

    // Send email to user
    try {
      await emailService.sendEmail({
        to: serviceRequest.user.email,
        subject: `Worker Assigned - ${serviceRequest.serviceType}`,
        html: `
          <h2>Worker Assigned to Your Service Request</h2>
          <p>Dear ${serviceRequest.user.name},</p>
          <p>Great news! We have assigned a worker for your ${serviceRequest.serviceType} service request.</p>
          <br>
          <h3>Worker Details:</h3>
          ${businessLine}
          <p><strong>Name:</strong> ${effectiveWorkerName}</p>
          <p><strong>Phone:</strong> ${effectiveWorkerPhone}</p>
          <br>
          <p><strong>Your Problem:</strong> ${serviceRequest.problemDescription}</p>
          <br>
          <p>The worker will contact you shortly. You can also call them directly at ${effectiveWorkerPhone}.</p>
          <p>Request ID: #${serviceRequest.id}</p>
          <br>
          <p>Thank you for choosing INFRAALL!</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send assignment email to user:', emailError);
    }

    const updated = await ServiceRequest.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'businessName', 'contactPerson', 'contactPhone'] }
      ]
    });

    res.json({
      message: vendor ? 'Vendor assigned successfully' : 'Worker assigned successfully',
      serviceRequest: updated
    });
  } catch (error) {
    console.error('Assign worker error:', error);
    res.status(500).json({ message: 'Failed to assign worker', error: error.message });
  }
};

// Admin: Update service request status
const updateServiceRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const serviceRequest = await ServiceRequest.findByPk(id);

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    await serviceRequest.update({ status, adminNotes });

    res.json({
      message: 'Service request status updated successfully',
      serviceRequest
    });
  } catch (error) {
    console.error('Update service request status error:', error);
    res.status(500).json({ message: 'Failed to update service request status', error: error.message });
  }
};

// Get service request statistics
const getServiceRequestStats = async (req, res) => {
  try {
    const total = await ServiceRequest.count();
    const pending = await ServiceRequest.count({ where: { status: 'pending' } });
    const assigned = await ServiceRequest.count({ where: { status: 'assigned' } });
    const completed = await ServiceRequest.count({ where: { status: 'completed' } });
    const cancelled = await ServiceRequest.count({ where: { status: 'cancelled' } });

    res.json({
      total,
      pending,
      assigned,
      completed,
      cancelled
    });
  } catch (error) {
    console.error('Get service request stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

module.exports = {
  createServiceRequest,
  getUserServiceRequests,
  getAllServiceRequests,
  assignWorker,
  updateServiceRequestStatus,
  getServiceRequestStats
};
