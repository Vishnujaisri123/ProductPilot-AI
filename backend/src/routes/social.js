const router = require('express').Router();
const ctrl = require('../controllers/socialController');
const { protect } = require('../middleware/auth');

// Accounts
router.get('/accounts', protect, ctrl.getAccounts);
router.post('/accounts/connect', protect, ctrl.connectAccount);
router.post('/accounts/:id/test', protect, ctrl.testAccount);
router.delete('/accounts/:id', protect, ctrl.disconnectAccount);

// Campaigns
router.get('/campaigns', protect, ctrl.getCampaigns);
router.post('/campaigns', protect, ctrl.createCampaign);
router.patch('/campaigns/:id', protect, ctrl.updateCampaign);
router.delete('/campaigns/:id', protect, ctrl.deleteCampaign);

// Posts & Generation
router.get('/posts', protect, ctrl.getPosts);
router.post('/posts/generate', protect, ctrl.generateSocialContent);
router.post('/posts/schedule', protect, ctrl.schedulePost);
router.post('/posts/:id/publish', protect, ctrl.publishPostNow);
router.delete('/posts/:id', protect, ctrl.deletePost);

// Media Repurposing
router.post('/repurpose/thumbnail', protect, ctrl.createThumbnailImage);
router.post('/repurpose/video', protect, ctrl.repurposeVideoContent);

module.exports = router;
