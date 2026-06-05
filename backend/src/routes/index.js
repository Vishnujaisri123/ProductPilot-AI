const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/extract', require('./extraction'));
router.use('/telegram', require('./telegram'));
router.use('/analytics', require('./analytics'));
router.use('/knowledge', require('./knowledge'));
router.use('/billing', require('./billing'));
router.use('/admin', require('./admin'));
router.use('/products', require('./products'));
router.use('/public', require('./public'));

module.exports = router;
