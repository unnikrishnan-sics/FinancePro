const express = require('express');
const router = express.Router();
const {
    submitContact,
    submitFeedback,
    getAllMessages,
    markAsRead
} = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/contact', submitContact);
router.post('/feedback', protect, submitFeedback);
router.get('/all', protect, admin, getAllMessages);
router.put('/:id/read', protect, admin, markAsRead);

module.exports = router;
