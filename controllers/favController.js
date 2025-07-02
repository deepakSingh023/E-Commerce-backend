const Favorite = require('../models/favourite');
const Product = require('../models/product');



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




  module.exports={
    createFavorite,
    removeFavourite,
    getAllFavourite
  }

