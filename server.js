const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
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

const db = new sqlite3.Database(process.env.DATABASE_URL || './leaderboard.db');

// Middleware for logging each request
app.use((req, res, next) => {
    logger.info(`Received request for ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.static('public'));

// Create the leaderboard table if it doesn't exist
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY, score INTEGER)', (err) => {
        if (err) {
            logger.error('Error creating table:', err);
        } else {
            logger.info('Leaderboard table ready');
        }
    });
});

// API to submit score
app.post('/api/leaderboard', (req, res) => {
    const { score } = req.body;
    db.run('INSERT INTO leaderboard (score) VALUES (?)', [score], (err) => {
        if (err) {
            logger.error('Error inserting score:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        logger.info(`Score submitted: ${score}`);
        res.json({ message: 'Score saved' });
    });
});

// API to get leaderboard
app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10', (err, rows) => {
        if (err) {
            logger.error('Error fetching leaderboard:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
