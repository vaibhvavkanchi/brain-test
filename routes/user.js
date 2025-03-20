import express from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Add User Points
router.post("/addPoints", authenticate, async (req, res) => {
    const { points } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.points += points;
        await user.save();
        res.json({ message: "Points added successfully!" });
    } catch (error) {
        console.error("Error adding points:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/profile", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclude password field if present

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            language: user.language,
            points: user.points,
            solvedPuzzles: user.solvedPuzzles
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
