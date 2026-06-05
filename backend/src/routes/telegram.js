// telegram.js
const router = require('express').Router();
const ctrl = require('../controllers/telegramController');
const { protect } = require('../middleware/auth');

router.post('/config', protect, ctrl.saveConfig);
router.post('/test', protect, ctrl.testConnection);
router.post('/resend/:id', protect, ctrl.resend);
router.patch('/toggle', protect, ctrl.toggleEnabled);

module.exports = router;
