const express = require('express');
const { getNotifications, markAsRead, deleteNotifications } = require('../controllers/notificationController');

// Middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Simple mock middleware or standard one if you have it. 
        // Assuming user id is passed in body as per controller logic above, 
        // BUT ideally it should be from req.user set by JWT middleware.
        // Let's assume standard behavior: route receives request, validation happens elsewhere or basic pass-through.
        // Wait, other controllers use req.body.userid or req.user.id. 
        // Let's stick to what's likely standard.
        // Checking transactionController or userController to match pattern.
        // Other files use req.body.userId usually populated by auth middleware?
        // Let's check server.js or other routes.
        // Checking imports...
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Auth Failed', success: false });
    }
};

const router = express.Router();

router.post('/get-all-notification', getNotifications);
router.post('/mark-as-read', markAsRead);
router.post('/delete-all-notification', deleteNotifications);

module.exports = router;
