const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { createProduct, deleteProduct } = require('../controllers/adminController');

router.post('/createProduct', auth, upload.array('images', 4), createProduct);
router.delete('/deleteProduct/:id', auth, deleteProduct);

module.exports = router;
