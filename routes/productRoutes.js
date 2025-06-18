const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, addToCart, getCartProducts, placeOrder } = require('../controllers/productController');
const auth = require('../middlewares/auth');

router.get('/getAllProducts',auth, getAllProducts);
router.get('/getProductById/:id',auth,  getProductById);
router.post('/addToCart',auth, addToCart);
router.get('/getCartProducts',  auth, getCartProducts);
router.post('/placeOrder',  auth, placeOrder);

module.exports = router;