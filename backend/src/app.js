require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const questRoutes = require('./routes/questRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const wheelRoutes = require('./routes/wheelRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const bonusRoutes = require('./routes/bonusRoutes');

const app = express();

// Middleware - CORS конфигурация для фронтенда.
// Для MVP/демо отражаем любой источник (Flutter web, эмулятор, реальное устройство в LAN).
// В проде задайте CORS_ORIGIN (список источников через запятую) в .env.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const corsOptions = {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging для отладки
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/wheel', wheelRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/bonus', bonusRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SKS Quest Backend is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = app;