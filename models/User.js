import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    points: { type: Number, required: true },
    type: { type: String, enum: ["earn", "spend"], required: true }, // "earn" for adding points, "spend" for using points
    source: { type: String, enum: ["question", "scratch", "spin"], required: true }, // ✅ Track source
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
    transactions: [transactionSchema] // ✅ Store transaction history
});

const User = mongoose.model("User", userSchema);
export default User;
