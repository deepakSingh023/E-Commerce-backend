const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { createProduct, deleteProduct, updateProduct, deleteOrder, updateOrderStatus } = require('../controllers/adminController');

router.post('/createProduct', auth, upload.array('images', 4), createProduct);
router.delete('/deleteProduct/:id', auth, deleteProduct);
router.put('/updateProduct/:id', auth, upload.array('images', 4), updateProduct);
router.delete('/deleteOrder/:id', auth, deleteOrder);
router.patch('/updateOrderStatus', auth, updateOrderStatus);
module.exports = router;
