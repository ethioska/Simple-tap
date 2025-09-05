const express = require("express");
const bodyParser = require("body-parser");
const { addRewardToUser } = require("./db");
const { sendTON } = require("./ton");

const app = express();
app.use(bodyParser.json());
app.use(express.static("../webapp")); // serve frontend

app.post("/bot/reward", async (req, res) => {
    const { userId, score } = req.body;
    const reward = score * 0.1; // 0.1 TON per tap
    await addRewardToUser(userId, reward); 
    await sendTON(userId, reward); 
    res.json({ success: true, reward });
});

app.listen(3000, () => console.log("Mini app running on port 3000"));
