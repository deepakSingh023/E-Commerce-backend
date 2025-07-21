const express = require('express');
const router = express.Router();
const { getAllProducts, getProductsPage, getProductbyId, addReview } = require('../controllers/productController');

const auth = require('../middlewares/auth');

router.get('/getAllProducts',auth, getAllProducts);
router.get('/getProductsPage',  getProductsPage);
router.get('/getProductbyId/:id', auth, getProductbyId);
router.post('/addReview', auth, addReview);


module.exports = router;