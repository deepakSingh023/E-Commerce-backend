const express = require('express');
const router = express.Router();
const { getAllProducts, getProductsPage, getProductbyId, addReview, getFeaturedProducts } = require('../controllers/productController');
const optionalAuth = require('../middlewares/optionalAuth');
const auth = require('../middlewares/auth');

router.get('/getAllProducts',auth, getAllProducts);
router.get('/getProductsPage',  getProductsPage);
router.get('/getProductbyId/:id', auth, getProductbyId);
router.post('/addReview', auth, addReview);
router.get('/getFeaturedProducts',optionalAuth, getFeaturedProducts);


module.exports = router;