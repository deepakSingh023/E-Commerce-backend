const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/orders');
const favourite = require('../models/favourite');



const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





const getProductsPage = async (req, res) => {
    try {
    const page = Number(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const filters = {};

    // Optional: Filter by category if provided
    if (req.query.category) {
      filters.category = req.query.category;
    }

    // Optional: Filter by price if both min and max provided
    if (req.query.minPrice && req.query.maxPrice) {
      filters.price = {
        $gte: Number(req.query.minPrice),
        $lte: Number(req.query.maxPrice),
      };
    }

    // Optional: Filter by search text
    if (req.query.search) {
      filters.name = { $regex: req.query.search, $options: 'i' }; // case-insensitive
    }

    // Optional: Sort
    const sortOption = {};
    if (req.query.sortBy === 'price_asc') {
      sortOption.price = 1;
    } else if (req.query.sortBy === 'price_desc') {
      sortOption.price = -1;
    } else {
      sortOption.createdAt = -1; // default newest first
    }

    //  Get filtered + paginated data
    const products = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filters);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






module.exports = {
    getAllProducts,
    getProductsPage,
};


