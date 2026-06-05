const router = require('express').Router();
const ctrl = require('../controllers/knowledgeBaseController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('file'), ctrl.upload);
router.get('/', protect, ctrl.list);
router.delete('/:id', protect, ctrl.delete);

module.exports = router;
