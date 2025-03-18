const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["coach", "hunter"] }
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
