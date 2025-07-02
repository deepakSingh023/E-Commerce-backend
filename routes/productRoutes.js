const express = require('express');
const router = express.Router();
const { getAllProducts, getProductsPage } = require('../controllers/productController');

const auth = require('../middlewares/auth');

router.get('/getAllProducts',auth, getAllProducts);
router.get('/getProductsPage',auth,  getProductsPage);

module.exports = router;