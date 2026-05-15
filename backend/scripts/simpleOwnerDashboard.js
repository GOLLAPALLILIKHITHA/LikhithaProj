const express = require('express');
const { Op } = require('sequelize');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Purchase = require('../src/models/Purchase');
const PropertyRental = require('../src/models/PropertyRental');
const MonthlyPayment = require('../src/models/MonthlyPayment');
const auth = require('../src/middleware/auth');
require('dotenv').config();

// Simple owner dashboard that avoids problematic queries
async function getSimpleOwnerDashboard(req, res) {
  try {
    const ownerEmail = req.user.email;
    console.log('Getting dashboard for owner:', ownerEmail);

    // Get owner's properties based on contactEmail in listings
    const ownerListings = await Listing.findAll({
      where: { 
        [Op.or]: [
          { userId: req.user.id },
          { contactEmail: ownerEmail }
        ]
      },
      attributes: ['id', 'title', 'status', 'price', 'category']
    });

    console.log('Found listings:', ownerListings.length);

    // Calculate basic stats
    const totalProperties = ownerListings.length;
    const activeProperties = ownerListings.filter(l => l.status === 'active').length;
    const soldProperties = ownerListings.filter(l => l.status === 'sold').length;
    const rentedProperties = ownerListings.filter(l => l.status === 'rented').length;

    // Get listing IDs for further queries
    const listingIds = ownerListings.map(l => l.id);

    // Get purchase statistics (simplified)
    let totalPurchases = 0;
    let completedPurchases = 0;
    let purchaseEarnings = 0;

    if (listingIds.length > 0) {
      totalPurchases = await Purchase.count({
        where: { listingId: { [Op.in]: listingIds } }
      });

      completedPurchases = await Purchase.count({
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'completed'
        }
      });

      // Get completed purchases for earnings calculation
      const completedPurchasesList = await Purchase.findAll({
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'completed'
        },
        attributes: ['totalAmount']
      });

      purchaseEarnings = completedPurchasesList.reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0);
    }

    // Get rental statistics (simplified)
    let totalRentals = 0;
    let activeRentals = 0;
    let rentEarnings = 0;

    if (listingIds.length > 0) {
      totalRentals = await PropertyRental.count({
        where: { listingId: { [Op.in]: listingIds } }
      });

      activeRentals = await PropertyRental.count({
        where: { 
          listingId: { [Op.in]: listingIds },
          status: 'active'
        }
      });

      // Get rental IDs for payment calculation
      const rentals = await PropertyRental.findAll({
        where: { listingId: { [Op.in]: listingIds } },
        attributes: ['id']
      });

      const rentalIds = rentals.map(r => r.id);

      if (rentalIds.length > 0) {
        const paidPayments = await MonthlyPayment.findAll({
          where: { 
            rentalId: { [Op.in]: rentalIds },
            status: 'paid'
          },
          attributes: ['amount']
        });

        rentEarnings = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      }
    }

    // Get recent purchases (simplified)
    let recentPurchases = [];
    if (listingIds.length > 0) {
      recentPurchases = await Purchase.findAll({
        where: { listingId: { [Op.in]: listingIds } },
        include: [{
          model: Listing,
          as: 'item',
          attributes: ['id', 'title', 'category', 'price']
        }, {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email', 'phone']
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
    }

    // Get recent rent payments (simplified)
    let recentRentPayments = [];
    if (listingIds.length > 0) {
      const rentals = await PropertyRental.findAll({
        where: { listingId: { [Op.in]: listingIds } },
        attributes: ['id']
      });

      const rentalIds = rentals.map(r => r.id);

      if (rentalIds.length > 0) {
        recentRentPayments = await MonthlyPayment.findAll({
          where: { 
            rentalId: { [Op.in]: rentalIds },
            status: 'paid'
          },
          include: [{
            model: PropertyRental,
            as: 'rental',
            include: [{
              model: Listing,
              as: 'property',
              attributes: ['id', 'title', 'location']
            }, {
              model: User,
              as: 'tenant',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          }],
          order: [['paidDate', 'DESC']],
          limit: 5
        });
      }
    }

    const dashboardData = {
      overview: {
        totalProperties,
        activeProperties,
        soldProperties,
        rentedProperties,
        totalPurchases,
        completedPurchases,
        totalRentals,
        activeRentals,
        totalEarnings: purchaseEarnings + rentEarnings,
        purchaseEarnings,
        rentEarnings
      },
      recentActivity: {
        purchases: recentPurchases,
        rentPayments: recentRentPayments
      }
    };

    console.log('Dashboard data generated successfully');
    res.json(dashboardData);

  } catch (error) {
    console.error('Simple owner dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data', 
      error: error.message 
    });
  }
}

// Test the simple dashboard function
async function testSimpleDashboard() {
  const axios = require('axios');
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing Simple Owner Dashboard...\n');
    
    // Login first
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'demo.owner@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    
    // Create a mock request object
    const mockReq = {
      user: {
        id: loginResponse.data.user.id,
        email: loginResponse.data.user.email
      }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Dashboard data generated successfully!');
        console.log('📊 Dashboard Overview:');
        console.log(`   Total Properties: ${data.overview.totalProperties}`);
        console.log(`   Active Properties: ${data.overview.activeProperties}`);
        console.log(`   Sold Properties: ${data.overview.soldProperties}`);
        console.log(`   Rented Properties: ${data.overview.rentedProperties}`);
        console.log(`   Total Earnings: ₹${data.overview.totalEarnings}`);
        console.log(`   Purchase Earnings: ₹${data.overview.purchaseEarnings}`);
        console.log(`   Rent Earnings: ₹${data.overview.rentEarnings}`);
        console.log(`   Recent Purchases: ${data.recentActivity.purchases.length}`);
        console.log(`   Recent Rent Payments: ${data.recentActivity.rentPayments.length}`);
        
        console.log('\n🎉 SUCCESS! The simple dashboard is working!');
        console.log('\n🔧 Next steps:');
        console.log('1. Replace the complex dashboard query with this simple version');
        console.log('2. Or sync the database schema to match the models');
        
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, data);
          return data;
        }
      })
    };
    
    // Test the simple dashboard
    await getSimpleOwnerDashboard(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testSimpleDashboard().catch(console.error);
}

module.exports = { getSimpleOwnerDashboard };