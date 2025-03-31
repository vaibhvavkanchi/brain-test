import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    points: { type: Number, required: true },
    type: { type: String, enum: ["earn", "spend"], required: true }, // "earn" for adding points, "spend" for using points
    source: { type: String, enum: ["question", "scratch", "spin", "flip"], required: true }, // ✅ Track source
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    profileImage: { type: String }, // ✅ Store user profile image
    solvedPuzzles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Puzzle" }],
    language: { type: String, enum: ["en", "hi"], default: "en" },// Store user-selected language
    points: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    transactions: [transactionSchema], // ✅ Store transaction history
    spinLimit: { type: Number, default: 3 }, // ✅ Set daily spin limit
    dailySpins: { type: Number, default: 0 }, // ✅ Track number of spins used
    lastSpinDate: { type: Date, default: null }, // ✅ Track the last spin date
    flipLimit: { type: Number, default: 3 }, // 💡 Daily flips
    lastFlipDate: { type: Date, default: null }, // 💡 Reset daily
    dailyFlips: { type: Number, default: 0 }, // 💡 Track number of flips used


});

const User = mongoose.model("User", userSchema);
export default User;
