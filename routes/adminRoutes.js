const express = require('express');
const router = express.Router();
const { createProduct } = require('../controllers/adminController');
const auth = require('../middlewares/auth');

router.post('/createProduct', auth, createProduct);

module.exports = router;