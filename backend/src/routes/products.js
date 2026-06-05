const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const productController = require('../controllers/productController');

router.use(protect);

router.get('/', productController.getProducts);
router.get('/by-extraction/:extractionId', productController.getProductByExtractionId);
router.get('/:id', productController.getProductById);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/telegram/bulk', productController.bulkTelegramSend);

module.exports = router;
