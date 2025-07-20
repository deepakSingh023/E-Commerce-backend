const mongoose = require ('mongoose');
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');


const getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.json([]); // return empty array if user has no cart yet
    }

    console.log("Cart items:", cart.items);

    res.json(cart.items); // send back only the array of items
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};



const addItemCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      // ✅ Product exists, so just update the quantity
      existingItem.quantity += quantity;
    } else {
      // ✅ Product does not exist, so add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res.status(201).json({ message: 'Product added/updated in cart' });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};


 const removeItemCart = async (req, res) => {
  try {
    const { productId } = req.body; // Only productId is needed now
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the index of the product to remove
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // ✅ Always remove the item (don't update quantity here)
    cart.items.splice(itemIndex, 1);

    await cart.save();

    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body; 
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


module.exports={
    getCartItems,
    addItemCart,
    removeItemCart,
    updateQuantity
}
