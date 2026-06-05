const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/products', publicController.getPublicProducts);
router.get('/products/:id', publicController.getPublicProductById);
router.get('/redirect/:id', publicController.redirectProduct);

module.exports = router;
