const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { searchOrdersByUsername, getAllOrders, placeOrder, getOrderById } = require('../controllers/orderController');

router.get('/getAllOrders',auth, getAllOrders);
router.get('/searchOrdersByUsername',auth, searchOrdersByUsername);
router.post('/placeOrder', auth, placeOrder);
router.get('/getOrderById',auth, getOrderById);
module.exports = router;