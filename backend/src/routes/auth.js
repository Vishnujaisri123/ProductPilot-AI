const router = require('express').Router();
const passport = require('passport');
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.me);
router.patch('/me', protect, ctrl.updateMe);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);
router.post('/api-keys', protect, ctrl.generateApiKey);
router.delete('/api-keys/:keyId', protect, ctrl.deleteApiKey);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false }), ctrl.oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false }), ctrl.oauthCallback);

module.exports = router;
