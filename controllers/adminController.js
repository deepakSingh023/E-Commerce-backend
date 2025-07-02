const Product = require('../models/product')

const createProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      price,
      category,
      stock,
      inStock,
      featuredAt,
      features,
      size,
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'All fields are required including images' });
    }

    // Force type conversions
    price = Number(price);
    stock = Number(stock);
    inStock = inStock === 'true';
    featuredAt = featuredAt === 'true';

    // Ensure arrays
    if (typeof features === 'string') features = [features];
    if (typeof size === 'string') size = [size];

    // Check for duplicate
    const alreadyExist = await Product.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (alreadyExist) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      inStock,
      featuredAt,
      features,
      size,
      images,
    });

    await product.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name, price, description, category,
    stock, inStock, featuredAt, size, features
  } = req.body;

  let existingImages = [];

  try {
    // Parse existingImages
    if (req.body.existingImages) {
      existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages.map(img => JSON.parse(img))
        : [JSON.parse(req.body.existingImages)];
    }

    // Get new uploaded files
    const imageFiles = req.files || [];
    const newImages = imageFiles.map(file => ({
      url: `/uploads/${file.filename}`,
      publicId: file.filename
    }));

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        category,
        stock,
        inStock,
        featuredAt,
        size: Array.isArray(size) ? size : [size],
        features: Array.isArray(features) ? features : [features],
        images: [...existingImages, ...newImages]
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};


module.exports = { createProduct, deleteProduct, updateProduct };
