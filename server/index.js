const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const seedAdmin = require('./utils/seeder');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', require('./routes/notificationRoute'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/support', require('./routes/messageRoutes'));

// Seed Admin
seedAdmin();

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
}

module.exports = app;
