const Favorite = require('../models/favourite');
const Product = require('../models/product');
const mongoose = require('mongoose');



const createFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("🟢 Product ID from frontend:", productId);

    const userId = req.user._id;
    console.log("🔵 User ID from token/middleware:", userId);

    if (!userId || !productId) {
      console.log("❌ Missing userId or productId");
      return res.status(400).json({ message: "userId or productId missing" });
    }

    const existingFavorite = await Favorite.findOne({ user: userId, product: productId });
    console.log("🟡 Existing favorite:", existingFavorite);

    if (existingFavorite) {
      return res.status(200).json({ message: "Product already in favorites" });
    }

    const favorite = await Favorite.create({ user: userId, product: productId });
    console.log("✅ Favourite created:", favorite);

    res.status(201).json({ message: "Product added to favorites", favorite });
  } catch (error) {
    console.error("🔥 Server Error in createFavorite:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const removeFavourite= async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    const favorite = await Favorite.findOneAndDelete({ user: userId, product: productId });


    if (!favorite) {
      return res.status(404).json({ message: 'Product not found in favorites' });
    }

    res.status(200).json({ message: 'Product removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}


const getAllFavourite= async (req, res) => {
   const user = req.user; 
   const userId = new mongoose.Types.ObjectId(req.user._id);
   console.log("🔵 User ID from token/middleware:", user._id);

  try {
    const favorites = await Favorite.find({ user: user._id }).populate('product');
    res.json(favorites);
    console.log("🟢 Favourites fetched successfully:", favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
  };




  module.exports={
    createFavorite,
    removeFavourite,
    getAllFavourite
  }

