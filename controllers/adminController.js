const User = require('../models/user');
const Product = require('../models/product');

const createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Check required fields
    if (!name || !description || !price || !req.file) {
      return res.status(400).json({ message: 'All fields are required including image' });
    }

    // Check user role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin' });
    }

    // Check for duplicate product name
    const alreadyExist = await Product.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    });
    if (alreadyExist) {
      return res.status(400).json({ message: 'Product with this name already exists. Please choose a different name.' });
    }

    // Store image URL from Cloudinary
    const imageUrl = req.file.path; // Cloudinary auto-stores `path` as the public image URL
    const publicId = req.file.filename; // Optional: for future delete/reference

    const product = new Product({
      name,
      description,
      price,
      image: imageUrl,
      cloudinaryId: publicId, // Optional: store Cloudinary image ID
    });

    await product.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
};
