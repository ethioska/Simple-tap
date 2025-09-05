const express = require('express');
const router = express.Router();
const { db, getUser } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get all tasks
router.get('/', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if(err) return res.json({ success: false, message: "Server error" });
    res.json({ success: true, tasks: rows });
  });
});

// Complete a task
router.post('/complete', async (req, res) => {
  const { userId, taskId } = req.body;

  if(!userId || !taskId) return res.json({ success: false, message: "Missing userId or taskId" });

  try {
    const taskRow = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM tasks WHERE taskId = ?", [taskId], (err, row) => {
        if(err) reject(err);
        else resolve(row);
      });
    });

    if(!taskRow) return res.json({ success: false, message: "Task not found" });

    let completedBy = JSON.parse(taskRow.completedBy || '[]');
    if(completedBy.includes(userId)) return res.json({ success: false, message: "Task already completed" });

    completedBy.push(userId);
    db.run("UPDATE tasks SET completedBy = ? WHERE taskId = ?", [JSON.stringify(completedBy), taskId]);

    // Give reward to user
    const user = await getUser(userId);
    const newBalance = user.balance + taskRow.reward;
    db.run("UPDATE users SET balance = ? WHERE userId = ?", [newBalance, userId]);

    // Log transaction
    const txId = uuidv4();
    db.run("INSERT INTO transactions(txId, userId, type, amount) VALUES(?, ?, ?, ?)", [txId, userId, 'task_reward', taskRow.reward]);

    res.json({ success: true, message: "Task completed!", balance: newBalance });

  } catch(err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;
