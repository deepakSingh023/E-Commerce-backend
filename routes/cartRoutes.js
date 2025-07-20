const cart = require('../controllers/cart');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');



router.get('/getCartItems',auth, cart.getCartItems);
router.post('/addItemCart',auth, cart.addItemCart);
router.delete('/removeItemCart', auth, cart.removeItemCart);
router.post('/updateQuantity', auth,cart.updateQuantity);

module.exports = router;