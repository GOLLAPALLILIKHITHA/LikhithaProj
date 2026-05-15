const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const emailService = require('../services/emailService');

/**
 * OWNER ACCOUNT MANAGEMENT CONTROLLER
 * For admin to manage auto-created owner accounts
 */

// Get all owner accounts (users who have properties via contactEmail)
exports.getOwnerAccounts = async (req, res) => {
  try {
    const { search, verified, page = 1, limit = 20 } = req.query;

    // Find all unique contact emails from listings
    const contactEmails = await Listing.findAll({
      attributes: ['contactEmail'],
      where: {
        contactEmail: { [Op.ne]: null }
      },
      group: ['contactEmail'],
      raw: true
    });

    const emails = contactEmails.map(item => item.contactEmail).filter(Boolean);

    if (emails.length === 0) {
      return res.json({ owners: [], total: 0, page: 1, totalPages: 0 });
    }

    // Find users with these emails
    const where = { email: { [Op.in]: emails } };
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    // Get property counts for each owner
    const ownersWithStats = await Promise.all(rows.map(async (owner) => {
      const propertyCount = await Listing.count({
        where: { contactEmail: owner.email }
      });

      const activeProperties = await Listing.count({
        where: { 
          contactEmail: owner.email,
          status: 'active'
        }
      });

      const recentProperties = await Listing.findAll({
        where: { contactEmail: owner.email },
        attributes: ['id', 'title', 'category', 'status', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 3
      });

      return {
        ...owner.toJSON(),
        stats: {
          totalProperties: propertyCount,
          activeProperties,
          recentProperties
        }
      };
    }));

    res.json({
      owners: ownersWithStats,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get owner accounts error:', error);
    res.status(500).json({ message: 'Failed to fetch owner accounts', error: error.message });
  }
};

// Set password for owner account
exports.setOwnerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, sendEmail = true } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const owner = await User.findByPk(id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner account not found' });
    }

    // Check if this user has properties via contactEmail
    const propertyCount = await Listing.count({
      where: { contactEmail: owner.email }
    });

    if (propertyCount === 0) {
      return res.status(400).json({ message: 'This user is not associated with any properties' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await owner.update({
      password: hashedPassword,
      isVerified: true // Mark as verified when admin sets password
    });

    // Send email to owner with login credentials
    if (sendEmail) {
      try {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        
        await emailService.sendEmail({
          to: owner.email,
          subject: 'Your INFRAALL Owner Account is Ready',
          html: `
            <h2>Welcome to INFRAALL Owner Portal</h2>
            <p>Dear ${owner.name},</p>
            <p>Your owner account has been activated! You can now access your property dashboard to manage your listings and track earnings.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Login Credentials:</h3>
              <p><strong>Email:</strong> ${owner.email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Dashboard URL:</strong> <a href="${baseUrl}/owner/dashboard">${baseUrl}/owner/dashboard</a></p>
            </div>
            
            <p><strong>What you can do in your dashboard:</strong></p>
            <ul>
              <li>View all your property listings</li>
              <li>Track purchase transactions and payments</li>
              <li>Monitor rental agreements and rent payments</li>
              <li>View detailed financial analytics</li>
              <li>Manage property documents</li>
            </ul>
            
            <p><strong>Security Note:</strong> Please change your password after first login for security.</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>INFRAALL Team</p>
          `
        });
        
        console.log(`Password set and email sent to owner: ${owner.email}`);
      } catch (emailError) {
        console.error('Failed to send owner credentials email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      message: 'Owner password set successfully',
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        isVerified: owner.isVerified
      },
      emailSent: sendEmail
    });
  } catch (error) {
    console.error('Set owner password error:', error);
    res.status(500).json({ message: 'Failed to set owner password', error: error.message });
  }
};

// Get owner account details with properties
exports.getOwnerAccountDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const owner = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt', 'updatedAt']
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner account not found' });
    }

    // Get all properties for this owner
    const properties = await Listing.findAll({
      where: { contactEmail: owner.email },
      attributes: [
        'id', 'title', 'category', 'subCategory', 'price', 'priceType',
        'location', 'city', 'status', 'views', 'isVerified', 'isFeatured',
        'createdAt', 'contactPerson', 'contactPhone'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get summary statistics
    const stats = {
      totalProperties: properties.length,
      activeProperties: properties.filter(p => p.status === 'active').length,
      soldProperties: properties.filter(p => p.status === 'sold').length,
      rentedProperties: properties.filter(p => p.status === 'rented').length,
      pendingProperties: properties.filter(p => p.status === 'pending').length,
      totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0)
    };

    res.json({
      owner: owner.toJSON(),
      properties,
      stats
    });
  } catch (error) {
    console.error('Get owner account details error:', error);
    res.status(500).json({ message: 'Failed to fetch owner details', error: error.message });
  }
};

// Verify/unverify owner account
exports.toggleOwnerVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const owner = await User.findByPk(id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner account not found' });
    }

    await owner.update({
      isVerified: !owner.isVerified
    });

    res.json({
      message: `Owner account ${owner.isVerified ? 'verified' : 'unverified'} successfully`,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        isVerified: owner.isVerified
      }
    });
  } catch (error) {
    console.error('Toggle owner verification error:', error);
    res.status(500).json({ message: 'Failed to update owner verification', error: error.message });
  }
};

// Send login credentials to owner
exports.sendOwnerCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const owner = await User.findByPk(id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner account not found' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    await emailService.sendEmail({
      to: owner.email,
      subject: 'Your INFRAALL Owner Account Login Details',
      html: `
        <h2>INFRAALL Owner Portal Access</h2>
        <p>Dear ${owner.name},</p>
        <p>Here are your login credentials for the INFRAALL Owner Portal:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Login Details:</h3>
          <p><strong>Email:</strong> ${owner.email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Login URL:</strong> <a href="${baseUrl}/login">${baseUrl}/login</a></p>
          <p><strong>Dashboard URL:</strong> <a href="${baseUrl}/owner/dashboard">${baseUrl}/owner/dashboard</a></p>
        </div>
        
        <p>After logging in, you can access your owner dashboard to manage your properties and track earnings.</p>
        
        <p>Best regards,<br>INFRAALL Team</p>
      `
    });

    res.json({
      message: 'Login credentials sent successfully',
      sentTo: owner.email
    });
  } catch (error) {
    console.error('Send owner credentials error:', error);
    res.status(500).json({ message: 'Failed to send credentials', error: error.message });
  }
};

module.exports = {
  getOwnerAccounts: exports.getOwnerAccounts,
  setOwnerPassword: exports.setOwnerPassword,
  getOwnerAccountDetails: exports.getOwnerAccountDetails,
  toggleOwnerVerification: exports.toggleOwnerVerification,
  sendOwnerCredentials: exports.sendOwnerCredentials
};