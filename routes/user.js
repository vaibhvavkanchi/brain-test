import express from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Add User Points
// router.post("/addPoints", authenticate, async (req, res) => {
//     const { points } = req.body;
//     const userId = req.user.id;

//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         user.points += points;
//         user.coins += points; // Add points to coins as well
//         await user.save();
//         res.json({ message: "Points added successfully!" });
//     } catch (error) {
//         console.error("Error adding points:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// });
router.post("/addPoints", authenticate, async (req, res) => {
    const { points, source } = req.body;
    const userId = req.user.id;

    // ✅ Validate source type
    if (!["question", "scratch", "spin"].includes(source)) {
        return res.status(400).json({ message: "Invalid source type" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update points
        user.points += points;
        user.coins += points;
        // Store transaction with source
        user.transactions.push({ points, type: "earn", source });

        await user.save();
        res.json({ message: "Points added successfully!", currentPoints: user.points });
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
            coins: user.coins,
            solvedPuzzles: user.solvedPuzzles
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/spinLimit", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Reset daily spins if it's a new day
        const today = new Date().toISOString().split("T")[0];
        const lastSpinDay = user.lastSpinDate ? user.lastSpinDate.toISOString().split("T")[0] : null;

        if (today !== lastSpinDay) {
            user.dailySpins = 0; // Reset spins
            user.lastSpinDate = new Date();
            await user.save();
        }

        res.json({ spinLimit: user.spinLimit, dailySpins: user.dailySpins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/spin", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.dailySpins >= user.spinLimit) {
            return res.status(400).json({ message: "Daily spin limit reached" });
        }

        user.dailySpins += 1;
        await user.save();

        res.json({ message: "Spin recorded", dailySpins: user.dailySpins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/updateLanguage", authenticate, async (req, res) => {
    const { language } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.language = language;
        await user.save();
        res.json({ message: "Language updated successfully!" });
    } catch (error) {
        console.error("Error updating language:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
