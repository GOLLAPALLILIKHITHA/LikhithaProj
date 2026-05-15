const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Listing = require('../models/Listing');

exports.getVendorMe = async (req, res) => {
  const v = req.vendor;
  res.json({
    id: v.id,
    businessName: v.businessName,
    contactPerson: v.contactPerson,
    contactPhone: v.contactPhone,
    contactEmail: v.contactEmail,
    vendorType: v.vendorType,
    city: v.city,
    locality: v.locality,
    isVerified: v.isVerified,
  });
};

exports.getAssignments = async (req, res) => {
  const rows = await ServiceRequest.findAll({
    where: { vendorId: req.vendor.id },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  const assignments = rows.map((a) => ({
    id: a.id,
    serviceType: a.serviceType,
    problemDescription: a.problemDescription,
    status: a.status,
    userAddress: a.userAddress,
    userPhone: a.userPhone,
    customer: {
      name: a.user?.name,
      email: a.user?.email,
      phone: a.user?.phone || a.userPhone,
    },
    adminNotes: a.adminNotes,
    createdAt: a.createdAt,
    assignedAt: a.assignedAt,
    updatedAt: a.updatedAt,
  }));

  res.json({ assignments });
};

exports.getAssignmentById = async (req, res) => {
  const row = await ServiceRequest.findOne({
    where: { id: req.params.id, vendorId: req.vendor.id },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
      },
    ],
  });
  if (!row) {
    return res.status(404).json({ message: 'Assignment not found' });
  }
  res.json({
    id: row.id,
    serviceType: row.serviceType,
    problemDescription: row.problemDescription,
    status: row.status,
    userAddress: row.userAddress,
    userPhone: row.userPhone,
    customer: {
      name: row.user?.name,
      email: row.user?.email,
      phone: row.user?.phone || row.userPhone,
    },
    adminNotes: row.adminNotes,
    createdAt: row.createdAt,
    assignedAt: row.assignedAt,
    updatedAt: row.updatedAt,
  });
};

exports.markAssignmentCompleted = async (req, res) => {
  const row = await ServiceRequest.findOne({
    where: { id: req.params.id, vendorId: req.vendor.id },
  });
  if (!row) {
    return res.status(404).json({ message: 'Assignment not found' });
  }
  if (row.status !== 'assigned') {
    return res.status(400).json({ message: 'Only assigned jobs can be marked completed.' });
  }
  await row.update({ status: 'completed' });
  res.json({ message: 'Job marked as completed', assignment: { id: row.id, status: row.status } });
};

exports.getAssignedListings = async (req, res) => {
  const listings = await Listing.findAll({
    where: { vendorId: req.vendor.id },
    include: [
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'email', 'phone'],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  res.json({ listings });
};
