const Message = require('../models/messageModel');

// @desc    Submit public contact form
// @route   POST /api/v1/support/contact
// @access  Public
const submitContact = async (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !email || !message) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    try {
        const newMessage = await Message.create({
            name: `${firstName} ${lastName}`,
            email,
            message,
            type: 'CONTACT'
        });

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Submit user feedback
// @route   POST /api/v1/support/feedback
// @access  Private
const submitFeedback = async (req, res) => {
    const { message, rating } = req.body; // Rating optional if we want to add it later

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const newMessage = await Message.create({
            name: req.user.name,
            email: req.user.email,
            message,
            type: 'FEEDBACK',
            userId: req.user._id
        });

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all messages (Admin)
// @route   GET /api/v1/support/all
// @access  Private/Admin
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find({}).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark message as read
// @route   PUT /api/v1/support/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            message.read = true;
            await message.save();
            res.json({ message: 'Marked as read' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    submitContact,
    submitFeedback,
    getAllMessages,
    markAsRead
};
