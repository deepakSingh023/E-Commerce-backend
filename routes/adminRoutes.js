const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');         
const upload = require('../middlewares/multer');     
const { createProduct } = require('../controllers/adminController');


router.post('/createProduct', auth, upload.single('image'), createProduct);

module.exports = router;
