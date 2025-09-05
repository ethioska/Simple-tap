const express = require('express');
const router = express.Router();
const { db, getUser } = require('../db');
const { v4: uuidv4 } = require('uuid'); // For transaction IDs

// Tap / Earn endpoint
router.post('/', async (req, res) => {
  const { userId } = req.body;

  if(!userId) return res.json({ success: false, message: "No userId provided" });

  try {
    let user = await getUser(userId);

    // If user does not exist, create new
    if(!user) {
      db.run("INSERT INTO users(userId) VALUES(?)", [userId]);
      user = await getUser(userId);
    }

    if(user.energy <= 0) {
      return res.json({ success: false, message: "No energy left!" });
    }

    // Calculate points earned
    const pointsEarned = 10; // base points per tap
    const newBalance = user.balance + pointsEarned;
    const newEnergy = user.energy - 1;

    // Update database
    db.run("UPDATE users SET balance = ?, energy = ? WHERE userId = ?", [newBalance, newEnergy, userId]);

    // Log transaction
    const txId = uuidv4();
    db.run("INSERT INTO transactions(txId, userId, type, amount) VALUES(?, ?, ?, ?)", [txId, userId, 'reward', pointsEarned]);

    res.json({
      success: true,
      balance: newBalance,
      energy: newEnergy,
      pointsEarned
    });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;
