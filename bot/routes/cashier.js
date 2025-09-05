const express = require('express');
const router = express.Router();
const { db, getUser } = require('../db');
const { v4: uuidv4 } = require('uuid');
// const ton = require('../utils/ton'); // Uncomment when TON functions are ready

// Deposit TON (example, adjust for Telegram TON API)
router.post('/deposit', async (req, res) => {
  const { userId, amount } = req.body;

  if(!userId || !amount) return res.json({ success: false, message: "Missing userId or amount" });

  try {
    const user = await getUser(userId);
    if(!user) return res.json({ success: false, message: "User not found" });

    // TODO: integrate Telegram TON deposit API here

    const newBalance = user.balance + amount;
    db.run("UPDATE users SET balance = ? WHERE userId = ?", [newBalance, userId]);

    // Log transaction
    const txId = uuidv4();
    db.run("INSERT INTO transactions(txId, userId, type, amount) VALUES(?, ?, ?, ?)", [txId, userId, 'deposit', amount]);

    res.json({ success: true, message: "Deposit successful!", balance: newBalance });

  } catch(err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

// Withdraw TON
router.post('/withdraw', async (req, res) => {
  const { userId, amount } = req.body;

  if(!userId || !amount) return res.json({ success: false, message: "Missing userId or amount" });

  try {
    const user = await getUser(userId);
    if(!user) return res.json({ success: false, message: "User not found" });

    if(user.balance < amount) return res.json({ success: false, message: "Insufficient balance" });

    const newBalance = user.balance - amount;
    db.run("UPDATE users SET balance = ? WHERE userId = ?", [newBalance, userId]);

    // TODO: integrate Telegram TON withdraw API here

    // Log transaction
    const txId = uuidv4();
    db.run("INSERT INTO transactions(txId, userId, type, amount) VALUES(?, ?, ?, ?)", [txId, userId, 'withdraw', amount]);

    res.json({ success: true, message: "Withdrawal successful!", balance: newBalance });

  } catch(err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;
