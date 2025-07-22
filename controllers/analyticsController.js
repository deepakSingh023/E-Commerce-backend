const Order = require('../models/orders');
const Product = require('../models/product');
const User = require('../models/user');

// Get sales data (overall, by period, by category)
const getSalesData = async (req, res) => {
  try {
    // 1. Total sales
    const totalSales = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // 2. Sales by time period (last 30 days)
    const salesByDate = await Order.aggregate([
      { $match: { 
        status: 'Delivered',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }},
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 3. Sales by category
    const salesByCategory = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product"
      }},
      { $unwind: "$product" },
      { $group: {
        _id: "$product.category",
        total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
        count: { $sum: 1 }
      }}
    ]);

    res.status(200).json({
      totalSales: totalSales[0]?.total || 0,
      salesByDate,
      salesByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order analytics
const getOrderAnalytics = async (req, res) => {
  try {
    // Order status distribution
    const orderStatus = await Order.aggregate([
      { $group: { 
        _id: "$status", 
        count: { $sum: 1 } 
      }}
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $group: { 
        _id: null, 
        avg: { $avg: "$totalPrice" } 
      }}
    ]);

    // Orders over time (last 7 days)
    const ordersByDate = await Order.aggregate([
      { $match: { 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }},
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      orderStatus,
      avgOrderValue: avgOrderValue[0]?.avg || 0,
      ordersByDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product analytics
const getProductAnalytics = async (req, res) => {
  try {
    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        totalSold: { $sum: "$orderItems.qty" },
        totalRevenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Stock alerts (low inventory)
    const lowStock = await Product.find({ 
      stock: { $lt: 10 } 
    }).limit(5).select('name stock price');

    // Product ratings
    const topRated = await Product.aggregate([
      { $project: {
        name: 1,
        avgRating: { $avg: "$reviews.rating" },
        reviewCount: { $size: "$reviews" }
      }},
      { $match: { avgRating: { $gte: 4 }, reviewCount: { $gte: 5 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({ topProducts, lowStock, topRated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    // Top customers (by order value)
    const topCustomers = await Order.aggregate([
      { $group: { 
        _id: "$user",
        totalSpent: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 }
      }},
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }},
      { $unwind: "$user" },
      { $project: {
        name: "$user.username",
        email: "$user.email",
        totalSpent: 1,
        orderCount: 1
      }}
    ]);

    // Customer locations
    const customerLocations = await Order.aggregate([
      { $group: { 
        _id: "$shippingInfo.city",
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // New customers (last 30 days)
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({ topCustomers, customerLocations, newCustomers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesData,
  getOrderAnalytics,
  getProductAnalytics,
  getCustomerAnalytics
};