const router = require('express').Router();
const ctrl = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

router.post('/checkout', protect, ctrl.createCheckout);
router.post('/webhook', require('express').raw({ type: 'application/json' }), ctrl.webhook);
router.get('/portal', protect, ctrl.getPortal);

module.exports = router;
