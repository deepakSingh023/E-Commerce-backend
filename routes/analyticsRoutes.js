const express = require('express');
const router = express.Router();
const { 
  getSalesData,
  getOrderAnalytics,
  getProductAnalytics,
  getCustomerAnalytics
} = require('../controllers/analyticsController');
// const auth = require('../middlewares/auth');
// const admin = require('../middlewares/admin');

router.get('/sales',  getSalesData);
router.get('/orders', getOrderAnalytics);
router.get('/products', getProductAnalytics);
router.get('/customers', getCustomerAnalytics);

module.exports = router;