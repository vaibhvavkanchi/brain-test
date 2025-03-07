import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    solvedPuzzles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Puzzle" }],
    language: { type: String, enum: ["en", "hi"], default: "en" } // Store user-selected language
});

const User = mongoose.model("User", userSchema);
export default User;
