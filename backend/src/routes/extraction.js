const router = require('express').Router();
const ctrl = require('../controllers/extractionController');
const { protect, apiKeyAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.post('/', protect, uploadLimiter, upload.single('image'), ctrl.uploadAndExtract);
router.post('/batch', protect, uploadLimiter, upload.array('images', 20), ctrl.batchUpload);
router.get('/history', protect, ctrl.getHistory);
router.get('/:id', protect, ctrl.getStatus);
router.get('/:id/export/json', protect, ctrl.exportJSON);
router.get('/export/csv', protect, ctrl.exportCSV);
router.get('/export/excel', protect, ctrl.exportExcel);
router.patch('/:id/affiliate', protect, ctrl.updateAffiliate);
router.post('/:id/telegram', protect, ctrl.sendTelegramManual);

// API access
router.post('/api/extract', apiKeyAuth, upload.single('image'), ctrl.uploadAndExtract);
router.post('/api/batch', apiKeyAuth, upload.array('images', 20), ctrl.batchUpload);

module.exports = router;
