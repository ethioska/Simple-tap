const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const { db, getUser } = require('./db');

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Your Telegram bot token
const BOT_TOKEN = '8091734140:AAExgk6dDcTX6r8LK0XsWn8cFOlMH7qfazQ';
const bot = new Telegraf(BOT_TOKEN);

// --- Telegram Bot Commands ---
bot.start((ctx) => ctx.reply('Welcome to TapSwap Mini App!'));
bot.help((ctx) => ctx.reply('Use /start to play the game and earn points!'));

// Start the bot
bot.launch().then(() => console.log('Telegram bot started!'));

// --- Simple test route ---
app.get('/', (req, res) => {
  res.send('TapSwap Mini App Backend is running!');
});

// --- Import routes ---
const tapRoutes = require('./routes/tap');
const boostRoutes = require('./routes/boost');
const tasksRoutes = require('./routes/tasks');
const cashierRoutes = require('./routes/cashier');

app.use('/tap', tapRoutes);
app.use('/boost', boostRoutes);
app.use('/tasks', tasksRoutes);
app.use('/cashier', cashierRoutes);

// --- Start Express server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
