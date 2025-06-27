const product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/orders');
const favourite = require('../models/favourite');

const createFavorite=async (req,res)=>{
 const { productId } = req.body;
  const userId = req.user._id;

  try {
    const existingFavorite = await Favorite.findOne({ user: userId, product: productId });

    if (existingFavorite) {
      return res.status(200).json({ message: 'Product already in favorites' });
    }

    const favorite = await Favorite.create({ user: userId, product: productId });
    res.status(201).json({ message: 'Product added to favorites', favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const removeFavourite= async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    const favorite = await favourite.findOneAndDelete({ user: userId, product: productId });

    if (!favorite) {
      return res.status(404).json({ message: 'Product not found in favorites' });
    }

    res.status(200).json({ message: 'Product removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}


const getAllFavourite= async (req, res) => {
   const userId = req.user._id;

  try {
    const favorites = await Favorite.find({ user: userId }).populate('product');
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
  };



const getAllProducts = async (req, res) => {
    try {
        const products = await product.find();
        res.status(200).json( products );
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
    
    placeOrder,
    createFavorite,
    getAllFavourite,
    removeFavourite
};


