const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AuthController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { email, password, username } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email и пароль обязательны' });
            }
            
            // Check if user exists
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'Пользователь уже существует' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create user
            const result = await pool.query(
                `INSERT INTO users (email, password_hash, username, role, pseudo_name)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, email, username, role`,
                [email, hashedPassword, username || email, 'client', username || email]
            );
            
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            
            res.json({
                success: true,
                user,
                token
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка регистрации' });
        }
    },

    // Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email и пароль обязательны' });
            }
            
            // Get user
            const result = await pool.query(
                'SELECT id, email, password_hash, role FROM users WHERE email = $1',
                [email]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Неверные учётные данные' });
            }
            
            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Неверные учётные данные' });
            }
            
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка входа' });
        }
    },

    // Get current user
    getCurrentUser: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id, email, username, role, pseudo_name, avatar, streak_days, total_bonus_earned, total_bonus_spent
                 FROM users WHERE id = $1`,
                [req.userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения пользователя' });
        }
    },

    // Update profile
    updateProfile: async (req, res) => {
        try {
            const { pseudo_name, avatar } = req.body;
            
            const result = await pool.query(
                `UPDATE users SET pseudo_name = COALESCE($1, pseudo_name), 
                                  avatar = COALESCE($2, avatar)
                 WHERE id = $3
                 RETURNING id, pseudo_name, avatar`,
                [pseudo_name, avatar, req.userId]
            );
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка обновления профиля' });
        }
    }
};

module.exports = AuthController;
