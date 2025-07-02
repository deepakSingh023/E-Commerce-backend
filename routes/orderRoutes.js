const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { searchOrdersByUsername, getAllOrders } = require('../controllers/orderController');

router.get('/getAllOrders',auth, getAllOrders);
router.get('/searchOrdersByUsername',auth, searchOrdersByUsername);

module.exports = router;