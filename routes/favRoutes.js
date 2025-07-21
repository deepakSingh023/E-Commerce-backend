const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createFavorite, getAllFavourite, removeFavourite, checkWishlist } = require('../controllers/favController');


router.post('/createFavorite',  auth, createFavorite);
router.get('/getAllFavourite',  auth, getAllFavourite);
router.delete('/removeFavorite',  auth, removeFavourite);
router.get("/check", auth , checkWishlist)
module.exports = router;