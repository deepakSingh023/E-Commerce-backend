const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, placeOrder , createFavorite, getAllFavourite, removeFavourite } = require('../controllers/productController');

const auth = require('../middlewares/auth');

router.get('/getAllProducts',auth, getAllProducts);
router.get('/getProductById/:id',auth,  getProductById);
router.post('/placeOrder',  auth, placeOrder);
router.post('/createFavorite',  auth, createFavorite);
router.get('/getAllFavourite',  auth, getAllFavourite);
router.delete('/removeFavourite',  auth, removeFavourite);

module.exports = router;