const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Initialize all gamification tables
const initGamificationTables = async () => {
    try {
        console.log('🔄 Initializing database tables...');

        // 1. Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                username VARCHAR(100),
                role VARCHAR(50) DEFAULT 'client',
                avatar VARCHAR(500),
                pseudo_name VARCHAR(100),
                streak_days INTEGER DEFAULT 0,
                last_checkin_date DATE,
                streak_freeze_until DATE,
                total_bonus_earned INTEGER DEFAULT 0,
                total_bonus_spent INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Create quests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS quests (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                bonus_reward INTEGER NOT NULL DEFAULT 0,
                created_by INTEGER,
                target_role VARCHAR(50),
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                is_seasonal BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Bonus transactions
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bonus_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                transaction_type VARCHAR(50) NOT NULL,
                source_id INTEGER,
                description TEXT,
                expires_at DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Achievements
        await pool.query(`
            CREATE TABLE IF NOT EXISTS achievements (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                badge_icon VARCHAR(500),
                requirement_type VARCHAR(50),
                requirement_value INTEGER,
                bonus_reward INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true
            )
        `);

        // 5. User achievements
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_achievements (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, achievement_id)
            )
        `);

        // 6. Wheel spins
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wheel_spins (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                spin_type VARCHAR(20) DEFAULT 'free',
                reward_type VARCHAR(50),
                reward_value INTEGER,
                reward_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Marketplace items
        await pool.query(`
            CREATE TABLE IF NOT EXISTS marketplace_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                price_bonus INTEGER NOT NULL,
                image_url VARCHAR(500),
                stock_limit INTEGER,
                remaining INTEGER,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. User purchases
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                item_id INTEGER REFERENCES marketplace_items(id),
                bonus_spent INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 9. Leagues
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leagues (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                min_bonus_month INTEGER DEFAULT 0,
                max_bonus_month INTEGER DEFAULT 999999,
                icon_url VARCHAR(500),
                rank_order INTEGER DEFAULT 0
            )
        `);

        // 10. User league history
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_league_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                league_id INTEGER REFERENCES leagues(id),
                month_year DATE,
                bonus_earned_month INTEGER DEFAULT 0
            )
        `);

        // 11. User quest progress
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_quest_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                quest_id INTEGER REFERENCES quests(id) ON DELETE CASCADE,
                completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Создаём индекс для user_quest_progress
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_user_quest_daily 
            ON user_quest_progress(user_id, quest_id, DATE(created_at))
        `);

        console.log('✅ All database tables initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
    }
};

// Seed initial data
const seedInitialData = async () => {
    try {
        // Leagues
        const leaguesCount = await pool.query('SELECT COUNT(*) FROM leagues');
        if (parseInt(leaguesCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO leagues (name, min_bonus_month, max_bonus_month, rank_order) VALUES
                ('Бронза', 0, 999, 1),
                ('Серебро', 1000, 2999, 2),
                ('Золото', 3000, 6999, 3),
                ('Платина', 7000, 14999, 4),
                ('Бриллиант', 15000, 999999, 5)
            `);
            console.log('✅ Leagues seeded');
        }

        // Achievements
        const achievementsCount = await pool.query('SELECT COUNT(*) FROM achievements');
        if (parseInt(achievementsCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO achievements (name, description, badge_icon, requirement_type, requirement_value, bonus_reward) VALUES
                ('Первый шаг', 'Совершить первый вход в игру', '/badges/first_step.png', 'login_count', 1, 50),
                ('Постоянный гость', 'Достичь 30-дневной серии входов', '/badges/loyal_guest.png', 'streak_days', 30, 500),
                ('Мастер квестов', 'Выполнить 50 квестов', '/badges/quest_master.png', 'quests_completed', 50, 1000),
                ('Тысячник', 'Накопить 1000 бонусов', '/badges/thousand.png', 'total_bonus', 1000, 200),
                ('Десятитысячник', 'Накопить 10000 бонусов', '/badges/ten_thousand.png', 'total_bonus', 10000, 1000),
                ('Приглашатель', 'Пригласить 5 друзей', '/badges/inviter.png', 'referrals', 5, 500)
            `);
            console.log('✅ Achievements seeded');
        }

        // Marketplace items
        const itemsCount = await pool.query('SELECT COUNT(*) FROM marketplace_items');
        if (parseInt(itemsCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO marketplace_items (name, description, category, price_bonus, stock_limit, remaining, is_active) VALUES
                ('Скидка 10% на проценты', 'Скидка на проценты по следующему займу', 'financial', 500, 100, 100, true),
                ('Бесплатное хранение 7 дней', '7 дней бесплатного хранения залога', 'financial', 300, 200, 200, true),
                ('Сертификат Wildberries 500₽', 'Электронный сертификат Wildberries', 'partner', 1000, 50, 50, true),
                ('Сертификат OZON 500₽', 'Электронный сертификат OZON', 'partner', 1000, 50, 50, true),
                ('Сертификат Яндекс.Маркет', 'Электронный сертификат Яндекс.Маркет', 'partner', 1000, 50, 50, true),
                ('Футболка СКС', 'Фирменная футболка с логотипом', 'merch', 2000, 30, 30, true),
                ('Термокружка СКС', 'Термокружка с логотипом', 'merch', 800, 100, 100, true),
                ('Благотворительность', 'Перевод в фонд помощи детям', 'charity', 100, null, null, true)
            `);
            console.log('✅ Marketplace items seeded');
        }

        // Quests
        const questsCount = await pool.query('SELECT COUNT(*) FROM quests');
        if (parseInt(questsCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO quests (title, description, bonus_reward, is_seasonal, is_active) VALUES
                ('Проверить статус залога', 'Перейдите в раздел "Залоги"', 10, false, true),
                ('Прочитать о золоте', 'Прочитайте нашу статью о инвестировании', 15, false, true),
                ('Посмотреть калькулятор', 'Воспользуйтесь калькулятором займа', 10, false, true),
                ('Пригласить друга', 'Пригласите друга по реферальной ссылке', 200, false, true),
                ('Заполнить профиль', 'Добавьте аватар и информацию профиля', 50, false, true)
            `);
            console.log('✅ Quests seeded');
        }

        // Test users
        const bcrypt = require('bcrypt');
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(usersCount.rows[0].count) === 0) {
            const testUsers = [
                { email: 'user1@test.com', password: 'password123', username: 'TestUser1', role: 'client', pseudo_name: 'Гость#12345' },
                { email: 'user2@test.com', password: 'password123', username: 'TestUser2', role: 'client', pseudo_name: 'Охотник#67890' },
                { email: 'marketing@test.com', password: 'password123', username: 'Marketer', role: 'marketing', pseudo_name: 'Маркетолог' },
                { email: 'admin@test.com', password: 'password123', username: 'Admin', role: 'admin', pseudo_name: 'Администратор' }
            ];

            for (const u of testUsers) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await pool.query(
                    `INSERT INTO users (email, password_hash, username, role, pseudo_name) VALUES ($1, $2, $3, $4, $5)`,
                    [u.email, hashedPassword, u.username, u.role, u.pseudo_name]
                );
            }
            console.log('✅ Test users seeded');
        }

        console.log('✅ Initial data seeding completed');
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    }
};

// Run initialization
initGamificationTables().then(() => seedInitialData());

module.exports = pool;
