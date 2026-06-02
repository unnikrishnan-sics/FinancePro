const express = require('express');
const router = express.Router();
const {
    submitContact,
    submitFeedback,
    getAllMessages,
    markAsRead,
    respondToMessage,
    getUserFeedback,
    chatWithAdvisor
} = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/contact', submitContact);
router.post('/feedback', protect, submitFeedback);
router.get('/all', protect, admin, getAllMessages);
router.put('/:id/read', protect, admin, markAsRead);
router.put('/:id/respond', protect, admin, respondToMessage);
router.get('/my-feedback', protect, getUserFeedback);
router.post('/chat', protect, chatWithAdvisor);

module.exports = router;
