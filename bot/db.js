const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(uri);
const dbName = "miniAppDB";

async function addRewardToUser(userId, reward) {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const user = await users.findOne({ userId });
    if (!user) {
        await users.insertOne({ userId, balance: reward });
    } else {
        await users.updateOne({ userId }, { $inc: { balance: reward } });
    }
}

module.exports = { addRewardToUser };
