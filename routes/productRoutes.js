const express = require('express');
const router = express.Router();
const { getAllProducts, getProductsPage, getProductbyId, addReview, getFeaturedProducts } = require('../controllers/productController');

const auth = require('../middlewares/auth');

router.get('/getAllProducts',auth, getAllProducts);
router.get('/getProductsPage',  getProductsPage);
router.get('/getProductbyId/:id', auth, getProductbyId);
router.post('/addReview', auth, addReview);
router.get('/getFeaturedProducts', auth, getFeaturedProducts);


module.exports = router;