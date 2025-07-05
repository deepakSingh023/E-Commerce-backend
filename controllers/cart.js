const mongoose = require ('mongoose');
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');


const getCartItems= async(req,res)=>{
    try{
        const user = req.user
         const userId = new mongoose.Types.ObjectId(req.user._id);
        const cartItems = await Cart.find({user:userId}).populate('product');
        res.json(cartItems);
    }catch(error){
        res.status(500).json({message:'Server error',error});
    }
}

const addItemCart = async (req, res) => {
    try {
      const { productId } = req.body;
      const {quantity} = req.body;
      const userId = req.user._id;
  
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        const newCart = new Cart({ user: userId });
        await newCart.save();
        cart = newCart;
      }
  
      cart.items.push({ product: productId, quantity: quantity });
      await cart.save();
  
      res.status(201).json({ message: 'Product added to cart' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }; 

 const removeItemCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body; // quantity passed from frontend
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // ✅ If quantity becomes 0, remove item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // ✅ Otherwise, update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 

const updateQuantity= async(req,res)=>{
    const { productId, quantity } = req.body; 
    const userId = req.user._id;

    try{
        const cart = await Cart.findOne({user:userId});
        if(!cart){
            return res.status(404).json({message:'Cart not found'});
        }
        const itemIndex = cart.items.findIndex(item=>item.product.toString()===productId);
        if(itemIndex===-1){
            return res.status(404).json({message:'Product not found in cart'});
        }
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.status(200).json({message:'Cart updated',cart});
    }catch(error){
        res.status(500).json({message:'Server error',error});
    }

}

module.exports={
    getCartItems,
    addItemCart,
    removeItemCart,
    updateQuantity
}
