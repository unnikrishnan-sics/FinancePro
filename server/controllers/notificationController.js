const Notification = require('../models/notificationModel');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.body.userId })
            .sort({ date: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).send(error);
    }
};

const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.body.userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).send('Notifications marked as read');
    } catch (error) {
        res.status(500).send(error);
    }
};

const deleteNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.body.userId });
        res.status(200).send('Notifications deleted');
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = { getNotifications, markAsRead, deleteNotifications };
