const product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/orders');


const getAllProducts = async (req, res) => {
    try {
        const products = await product.find();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await product.findById(req.params.id);
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body; 

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const user = await User.findById(req.user.userId);
    const existing = user.cart.find(
      item => item.productId.toString() === productId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.status(200).json({ message: 'Product added to cart', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getCartProducts = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.status(200).json({ cart: user.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const placeOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;

    // 1. Validate input
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    // 2. Calculate total price
    let totalPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      totalPrice += product.price * item.qty;
    }

    // 3. Create order
    const order = new Order({
      user: req.user.userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: paymentMethod === 'COD' ? false : true, // Assume COD not paid, others paid
      paidAt: paymentMethod === 'COD' ? null : new Date()
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder
    });

  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    getAllProducts,
    getProductById,
    addToCart,
    getCartProducts,
    placeOrder
};


