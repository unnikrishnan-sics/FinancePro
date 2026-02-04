const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const seedAdmin = require('./utils/seeder');

dotenv.config();

const startServer = async () => {
    try {
        await connectDB();
        await seedAdmin();
        console.log('🚀 Database connected and Admin seeded');
    } catch (error) {
        console.error('❌ Server initialization failed:', error);
    }
};
startServer();

const app = express();

const allowedOrigins = [
    process.env.ALLOWED_ORIGIN,
    'https://finance-profrontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

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

// Seed Admin removed from here as it is now in startServer();

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
}

module.exports = app;
