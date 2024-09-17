const express = require('express');
const app = express();
const betterSqlite3 = require('better-sqlite3');
const winston = require('winston');
require('dotenv').config();

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'game.log' }) // Log to a file
    ]
});

const db = new betterSqlite3(process.env.DATABASE_URL || './leaderboard.db');

// Create the leaderboard table if it doesn't exist
try {
    db.exec('CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY, name TEXT, score INTEGER)');
    logger.info('Leaderboard table ready');
} catch (err) {
    logger.error('Error creating table:', err);
}

app.use(express.json());
app.use(express.static('public'));

// API to submit score
app.post('/api/leaderboard', (req, res) => {
    const { score, name } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO leaderboard (name, score) VALUES (?, ?)');
        stmt.run(name, score);
        logger.info(`Score submitted: ${name} - ${score}`);
        res.json({ message: 'Score saved' });
    } catch (err) {
        logger.error('Error inserting score:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// API to get leaderboard
app.get('/api/leaderboard', (req, res) => {
    try {
        const stmt = db.prepare('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10');
        const rows = stmt.all();
        res.json(rows);
    } catch (err) {
        logger.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
