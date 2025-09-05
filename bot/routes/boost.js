const express = require('express');
const router = express.Router();
const { db, getUser } = require('../db');

// Boost endpoint
router.post('/', async (req, res) => {
  const { userId, type } = req.body;

  if(!userId || !type) return res.json({ success: false, message: "Missing userId or boost type" });

  try {
    const user = await getUser(userId);
    if(!user) return res.json({ success: false, message: "User not found" });

    let response = {};

    if(type === 'energy') {
      // Refill energy by 50 points
      const newEnergy = Math.min(user.energy + 50, 500); // max 500
      db.run("UPDATE users SET energy = ? WHERE userId = ?", [newEnergy, userId]);
      response = { success: true, message: "Energy boosted!", energy: newEnergy };
    } else if(type === 'points') {
      // Temporary points multiplier for next 5 taps
      let boosts = JSON.parse(user.boosts || '[]');
      boosts.push({ type: 'points', remaining: 5 });
      db.run("UPDATE users SET boosts = ? WHERE userId = ?", [JSON.stringify(boosts), userId]);
      response = { success: true, message: "Points boost activated! Next 5 taps earn double." };
    } else {
      return res.json({ success: false, message: "Invalid boost type" });
    }

    res.json(response);

  } catch(err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;
