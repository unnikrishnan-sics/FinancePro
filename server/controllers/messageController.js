const Message = require('../models/messageModel');
const Transaction = require('../models/transactionModel');
const Goal = require('../models/goalModel');

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

// @desc    Respond to a message/feedback (Admin)
// @route   PUT /api/v1/support/:id/respond
// @access  Private/Admin
const respondToMessage = async (req, res) => {
    const { responseText } = req.body;

    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            message.adminResponse = responseText || '';
            message.respondedAt = new Date();
            message.read = true; // Mark as read automatically on response
            await message.save();
            res.json(message);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get logged-in user's feedback history
// @route   GET /api/v1/support/my-feedback
// @access  Private
const getUserFeedback = async (req, res) => {
    try {
        const feedbacks = await Message.find({
            userId: req.user._id,
            type: 'FEEDBACK'
        }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Secure, Context-Aware RAG AI Chatbot (Gemini)
// @route   POST /api/v1/support/chat
// @access  Private
const chatWithAdvisor = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const userId = req.user._id;

        // Check if AI Advisor is disabled system-wide
        const SystemConfig = require('../models/configModel');
        const config = await SystemConfig.findOne({});
        if (config && config.disableAiAdvisor) {
            return res.status(503).json({ message: 'The AI Financial Advisor is currently disabled by the system administrator for maintenance.' });
        }

        // 1. Fetch real-time user context from DB
        const transactions = await Transaction.find({ user: userId }).sort({ date: 1 });
        const goals = await Goal.find({ user: userId });

        // Calculate stats
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        // Map goals
        const goalsInfo = goals.map(g => 
            `- ${g.title}: Target ₹${g.targetAmount.toLocaleString()}, Saved ₹${g.currentAmount.toLocaleString()} (Deadline: ${g.deadline ? new Date(g.deadline).toLocaleDateString() : 'N/A'}, Progress: ${Math.round((g.currentAmount / g.targetAmount) * 100)}%)`
        ).join('\n');

        // Map recent transactions
        const recentTx = transactions.slice(-15).map(t => 
            `- ${new Date(t.date).toLocaleDateString()}: ${t.type.toUpperCase()} ₹${t.amount.toLocaleString()} in ${t.category}`
        ).join('\n');

        // 2. Prepare dynamic system prompt context
        const systemInstruction = `You are FinancePro AI, a professional, friendly, and expert financial advisor for the FinancePro app.
        You are advising the user: ${req.user.name}.
        
        Here is the user's live financial profile:
        - Current Net Balance: ₹${balance.toFixed(2)}
        - Total Recorded Income: ₹${totalIncome.toFixed(2)}
        - Total Recorded Expense: ₹${totalExpense.toFixed(2)}
        
        Active Savings Goals:
        ${goalsInfo || 'No active savings goals found.'}
        
        Recent Transaction History:
        ${recentTx || 'No transaction records found.'}
        
        Use this real-time financial data to directly and accurately answer the user's specific questions about their budget, savings targets, spending patterns, goals, and emergency funds. Keep answers highly personalized, mathematically clear, concise (2-4 sentences max unless detailed calculation is requested), encouraging, and professional. 
        Always avoid providing stock or crypto trading tips—focus on fundamental personal finance rules (like the 50/30/20 budget rule, saving emergency funds, etc.).`;

        // 3. Call Gemini REST API using global fetch
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) {
            return res.status(500).json({ message: 'Gemini API Key is not configured on the server.' });
        }

        const contents = (history || []).map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text || h.parts?.[0]?.text || '' }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
        
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: contents
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error("Gemini API Error:", result);
            return res.status(500).json({ message: 'Error from Gemini AI Service', details: result.error?.message });
        }

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
        res.json({ text: responseText });

    } catch (error) {
        console.error("Advisor Chat Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    submitContact,
    submitFeedback,
    getAllMessages,
    markAsRead,
    respondToMessage,
    getUserFeedback,
    chatWithAdvisor
};
