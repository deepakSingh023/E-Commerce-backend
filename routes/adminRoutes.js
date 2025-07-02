const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { createProduct, deleteProduct, updateProduct } = require('../controllers/adminController');

router.post('/createProduct', auth, upload.array('images', 4), createProduct);
router.delete('/deleteProduct/:id', auth, deleteProduct);
router.put('/updateProduct/:id', auth, upload.array('images', 4), updateProduct);

module.exports = router;
