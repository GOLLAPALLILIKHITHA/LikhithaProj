const BuyRequest = require('../models/BuyRequest');
const PropertyRental = require('../models/PropertyRental');
const VisitBooking = require('../models/VisitBooking');
const KYC = require('../models/KYC');
const User = require('../models/User');
const Listing = require('../models/Listing');
const ServiceRequest = require('../models/ServiceRequest');
const Vendor = require('../models/Vendor');
const { Op } = require('sequelize');

// Get all requests consolidated in one endpoint
const getAllRequests = async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let allRequests = [];

    // Fetch Buy Requests
    if (!type || type === 'buy') {
      const buyWhere = {};
      if (status) buyWhere.status = status;

      const buyRequests = await BuyRequest.findAll({
        where: buyWhere,
        include: [
          { 
            model: User, 
            as: 'buyer', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing, 
            as: 'property',
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(buyRequests.map(req => ({
        id: req.id,
        type: 'buy_request',
        typeLabel: 'Property Purchase Request',
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.buyer.id,
          name: req.buyer.name,
          email: req.buyer.email,
          phone: req.buyer.phone
        },
        property: req.property ? {
          id: req.property.id,
          title: req.property.title,
          price: req.property.price,
          location: req.property.location,
          city: req.property.city,
          category: req.property.category,
          images: req.property.images
        } : null,
        details: {
          message: req.buyerMessage,
          adminNotes: req.adminNotes,
          approvedAt: req.approvedAt,
          completedAt: req.completedAt,
          agreementDocuments: req.agreementDocuments
        }
      })));
    }

    // Fetch Furniture Inquiries (from Messages related to furniture listings)
    if (!type || type === 'furniture') {
      const Message = require('../models/Message');
      
      const furnitureMessages = await Message.findAll({
        include: [
          { 
            model: User, 
            as: 'sender', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing,
            where: { category: 'furniture' },
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'brand', 'condition']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(furnitureMessages.map(msg => ({
        id: msg.id,
        type: 'furniture_inquiry',
        typeLabel: 'Furniture Inquiry',
        status: msg.isRead ? 'read' : 'pending',
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        user: {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          phone: msg.sender.phone
        },
        property: msg.Listing ? {
          id: msg.Listing.id,
          title: msg.Listing.title,
          price: msg.Listing.price,
          location: msg.Listing.location,
          city: msg.Listing.city,
          category: msg.Listing.category,
          images: msg.Listing.images
        } : null,
        details: {
          message: msg.content,
          brand: msg.Listing?.brand,
          condition: msg.Listing?.condition
        }
      })));
    }

    // Fetch Services Inquiries
    if (!type || type === 'services') {
      const Message = require('../models/Message');
      
      const serviceMessages = await Message.findAll({
        include: [
          { 
            model: User, 
            as: 'sender', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing,
            where: { category: 'services' },
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'serviceType', 'contactPerson', 'contactPhone', 'contactEmail']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      const serviceRequests = await ServiceRequest.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : undefined,
            required: !!search
          },
          {
            model: Vendor,
            as: 'vendor',
            attributes: ['id', 'businessName', 'contactPerson', 'contactPhone', 'vendorType'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(serviceMessages.map(msg => ({
        id: msg.id,
        type: 'service_inquiry',
        typeLabel: 'Service Inquiry',
        status: msg.isRead ? 'read' : 'pending',
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        user: {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          phone: msg.sender.phone
        },
        property: msg.Listing ? {
          id: msg.Listing.id,
          title: msg.Listing.title,
          price: msg.Listing.price,
          location: msg.Listing.location,
          city: msg.Listing.city,
          category: msg.Listing.category,
          images: msg.Listing.images
        } : null,
        details: {
          message: msg.content,
          serviceType: msg.Listing?.serviceType,
          contactPerson: msg.Listing?.contactPerson,
          contactPhone: msg.Listing?.contactPhone,
          contactEmail: msg.Listing?.contactEmail
        }
      })));

      allRequests = allRequests.concat(serviceRequests.map(req => ({
        id: req.id,
        type: 'service_request',
        typeLabel: 'Service Request',
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone
        },
        property: null,
        details: {
          serviceType: req.serviceType,
          problemDescription: req.problemDescription,
          userPhone: req.userPhone,
          userAddress: req.userAddress,
          workerName: req.workerName,
          workerPhone: req.workerPhone,
          vendorName: req.vendor?.businessName,
          adminNotes: req.adminNotes,
          assignedAt: req.assignedAt
        }
      })));
    }

    // Fetch Materials Inquiries
    if (!type || type === 'materials') {
      const Message = require('../models/Message');
      
      const materialMessages = await Message.findAll({
        include: [
          { 
            model: User, 
            as: 'sender', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing,
            where: { category: 'materials' },
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images', 'brand', 'quantity', 'unit']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(materialMessages.map(msg => ({
        id: msg.id,
        type: 'material_inquiry',
        typeLabel: 'Building Material Inquiry',
        status: msg.isRead ? 'read' : 'pending',
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        user: {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          phone: msg.sender.phone
        },
        property: msg.Listing ? {
          id: msg.Listing.id,
          title: msg.Listing.title,
          price: msg.Listing.price,
          location: msg.Listing.location,
          city: msg.Listing.city,
          category: msg.Listing.category,
          images: msg.Listing.images
        } : null,
        details: {
          message: msg.content,
          brand: msg.Listing?.brand,
          quantity: msg.Listing?.quantity,
          unit: msg.Listing?.unit
        }
      })));
    }

    // Fetch Rental Requests (pending rentals)
    if (!type || type === 'rental') {
      const rentalWhere = {};
      if (status) {
        rentalWhere.status = status;
      } else {
        rentalWhere.status = ['pending', 'active']; // Show pending and active by default
      }

      const rentalRequests = await PropertyRental.findAll({
        where: rentalWhere,
        include: [
          { 
            model: User, 
            as: 'tenant', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing, 
            as: 'property',
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(rentalRequests.map(req => ({
        id: req.id,
        type: 'rental_request',
        typeLabel: 'Property Rental Request',
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.tenant.id,
          name: req.tenant.name,
          email: req.tenant.email,
          phone: req.tenant.phone
        },
        property: req.property ? {
          id: req.property.id,
          title: req.property.title,
          price: req.property.price,
          location: req.property.location,
          city: req.property.city,
          category: req.property.category,
          images: req.property.images
        } : null,
        details: {
          startDate: req.startDate,
          endDate: req.endDate,
          monthlyRent: req.monthlyRent,
          advancePayment: req.advancePayment,
          initialPayment: req.initialPayment,
          paidUntilDate: req.paidUntilDate,
          paymentStatus: req.paymentStatus,
          monthlyPaymentStatus: req.monthlyPaymentStatus,
          tenantPhone: req.tenantPhone,
          tenantEmail: req.tenantEmail,
          notes: req.notes,
          adminNotes: req.adminNotes
        }
      })));
    }

    // Fetch Vacate Requests
    if (!type || type === 'vacate') {
      const vacateWhere = {
        vacateRequested: true
      };
      if (status) {
        if (status === 'pending') {
          vacateWhere.status = 'active'; // Pending vacate requests are still active
        } else {
          vacateWhere.status = status;
        }
      }

      const vacateRequests = await PropertyRental.findAll({
        where: vacateWhere,
        include: [
          { 
            model: User, 
            as: 'tenant', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing, 
            as: 'property',
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(vacateRequests.map(req => ({
        id: req.id,
        type: 'vacate_request',
        typeLabel: 'Property Vacate Request',
        status: req.status === 'active' ? 'pending' : req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.tenant.id,
          name: req.tenant.name,
          email: req.tenant.email,
          phone: req.tenant.phone
        },
        property: req.property ? {
          id: req.property.id,
          title: req.property.title,
          price: req.property.price,
          location: req.property.location,
          city: req.property.city,
          category: req.property.category,
          images: req.property.images
        } : null,
        details: {
          vacateDate: req.vacateDate,
          vacateReason: req.vacateReason,
          startDate: req.startDate,
          paidUntilDate: req.paidUntilDate,
          monthlyRent: req.monthlyRent,
          adminNotes: req.adminNotes
        }
      })));
    }

    // Fetch Visit Booking Requests
    if (!type || type === 'visit') {
      const visitWhere = {};
      if (status) visitWhere.status = status;

      const visitBookings = await VisitBooking.findAll({
        where: visitWhere,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          },
          { 
            model: Listing, 
            as: 'listing',
            attributes: ['id', 'title', 'price', 'location', 'city', 'category', 'images']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(visitBookings.map(req => ({
        id: req.id,
        type: 'visit_booking',
        typeLabel: 'Property Visit Booking',
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone
        },
        property: req.listing ? {
          id: req.listing.id,
          title: req.listing.title,
          price: req.listing.price,
          location: req.listing.location,
          city: req.listing.city,
          category: req.listing.category,
          images: req.listing.images
        } : null,
        details: {
          visitDate: req.visitDate,
          timeSlot: req.timeSlot,
          specificTime: req.specificTime,
          userPhone: req.userPhone,
          userEmail: req.userEmail,
          notes: req.notes,
          adminNotes: req.adminNotes
        }
      })));
    }

    // Fetch KYC Requests
    if (!type || type === 'kyc') {
      const kycWhere = {};
      if (status) kycWhere.status = status;

      const kycRequests = await KYC.findAll({
        where: kycWhere,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email', 'phone'],
            where: search ? {
              [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
              ]
            } : {}
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      allRequests = allRequests.concat(kycRequests.map(req => ({
        id: req.id,
        type: 'kyc_request',
        typeLabel: 'KYC Verification Request',
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone
        },
        property: null,
        details: {
          occupation: req.occupation,
          aadhaarNumber: req.aadhaarNumber,
          aadhaarUrl: req.aadhaarUrl,
          panUrl: req.panUrl,
          jobIdUrl: req.jobIdUrl,
          salarySlipUrl: req.salarySlipUrl,
          businessRegUrl: req.businessRegUrl,
          gstCertUrl: req.gstCertUrl,
          collegeIdUrl: req.collegeIdUrl,
          bonafideUrl: req.bonafideUrl,
          workProofUrl: req.workProofUrl,
          otherDocUrl: req.otherDocUrl,
          otherDocName: req.otherDocName,
          adminNotes: req.adminNotes,
          verifiedAt: req.verifiedAt
        }
      })));
    }

    // Sort all requests by creation date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get counts for each type
    const counts = {
      total: allRequests.length,
      buy_request: allRequests.filter(r => r.type === 'buy_request').length,
      rental_request: allRequests.filter(r => r.type === 'rental_request').length,
      vacate_request: allRequests.filter(r => r.type === 'vacate_request').length,
      visit_booking: allRequests.filter(r => r.type === 'visit_booking').length,
      kyc_request: allRequests.filter(r => r.type === 'kyc_request').length,
      furniture_inquiry: allRequests.filter(r => r.type === 'furniture_inquiry').length,
      service_inquiry: allRequests.filter(r => r.type === 'service_inquiry').length,
      material_inquiry: allRequests.filter(r => r.type === 'material_inquiry').length,
      service_requests: allRequests.filter(r => r.type === 'service_request').length,
      services: allRequests.filter(r => ['service_inquiry', 'service_request'].includes(r.type)).length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      active: allRequests.filter(r => r.status === 'active').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      completed: allRequests.filter(r => r.status === 'completed').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length,
      read: allRequests.filter(r => r.status === 'read').length
    };

    res.json({
      requests: allRequests,
      counts,
      page: parseInt(page),
      limit: parseInt(limit),
      total: allRequests.length
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

// Get request statistics
const getRequestStats = async (req, res) => {
  try {
    const Message = require('../models/Message');
    
    const buyRequestsTotal = await BuyRequest.count();
    const buyRequestsPending = await BuyRequest.count({ where: { status: 'pending' } });
    
    const rentalsTotal = await PropertyRental.count();
    const rentalsPending = await PropertyRental.count({ where: { status: 'pending' } });
    const rentalsActive = await PropertyRental.count({ where: { status: 'active' } });
    
    const vacateRequestsTotal = await PropertyRental.count({ where: { vacateRequested: true } });
    const vacateRequestsPending = await PropertyRental.count({ 
      where: { vacateRequested: true, status: 'active' } 
    });
    
    const visitBookingsTotal = await VisitBooking.count();
    const visitBookingsPending = await VisitBooking.count({ where: { status: 'pending' } });
    
    const kycTotal = await KYC.count();
    const kycPending = await KYC.count({ where: { status: 'pending' } });

    // Count messages for furniture, services, materials
    const furnitureInquiries = await Message.count({
      include: [{ model: Listing, where: { category: 'furniture' }, attributes: [] }]
    });
    
    const serviceInquiries = await Message.count({
      include: [{ model: Listing, where: { category: 'services' }, attributes: [] }]
    });
    
    const materialInquiries = await Message.count({
      include: [{ model: Listing, where: { category: 'materials' }, attributes: [] }]
    });

    const serviceRequestsTotal = await ServiceRequest.count();
    const serviceRequestsPending = await ServiceRequest.count({ where: { status: 'pending' } });

    res.json({
      buyRequests: { total: buyRequestsTotal, pending: buyRequestsPending },
      rentals: { total: rentalsTotal, pending: rentalsPending, active: rentalsActive },
      vacateRequests: { total: vacateRequestsTotal, pending: vacateRequestsPending },
      visitBookings: { total: visitBookingsTotal, pending: visitBookingsPending },
      kyc: { total: kycTotal, pending: kycPending },
      furnitureInquiries: { total: furnitureInquiries },
      serviceInquiries: { total: serviceInquiries },
      serviceRequests: { total: serviceRequestsTotal, pending: serviceRequestsPending },
      materialInquiries: { total: materialInquiries },
      totalPending: buyRequestsPending + rentalsPending + vacateRequestsPending + visitBookingsPending + kycPending + serviceRequestsPending
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

module.exports = {
  getAllRequests,
  getRequestStats
};
