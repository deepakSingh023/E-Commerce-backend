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

const getProductbyId = async (req, res) => {
  console.log("Product details route hit with ID:", req.params.id);
    const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addReview = async (req, res) => {
  const { productId, comment } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const newReview = {
      user: userId,
      username: user.username,
      comment,
      createdAt: new Date().toISOString()
    };

    product.reviews.push(newReview);
    await product.save();

    // ✅ Return the actual review object added
    res.status(200).json(newReview);
  } catch (error) {
    console.error("Add review error:", error.message);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const userId = req.user._id; // or use req.user.id if using auth middleware

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    // Step 1: Get latest 5 featured products
    const products = await Product.find({ featuredAt: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(); // lean() to get plain JS objects, not Mongoose docs

    const productIds = products.map((p) => p._id);

    // Step 2: Get favorite product IDs for this user
    const favorites = await favourite.find({
      user: userId,
      product: { $in: productIds }
    }).select('product');

    const favoriteProductIds = new Set(favorites.map((f) => f.product.toString()));

    // Step 3: Attach `isFavorite` flag to each product
    const productsWithFavorites = products.map((product) => ({
      ...product,
      isFavorite: favoriteProductIds.has(product._id.toString())
    }));

    // Response
    res.status(200).json(productsWithFavorites);

  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    res.status(500).json({ message: error.message });
  }
};





module.exports = {
    getAllProducts,
    getProductsPage,
    getProductbyId, 
    addReview, 
    getFeaturedProducts
};


