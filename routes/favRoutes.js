const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createFavorite, getAllFavourite, removeFavourite } = require('../controllers/favController');


router.post('/createFavorite',  auth, createFavorite);
router.get('/getAllFavourite',  auth, getAllFavourite);
router.delete('/removeFavourite',  auth, removeFavourite);

module.exports = router;