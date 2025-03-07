import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import Puzzle from "../models/Puzzle.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const { question, options, correctAnswer } = req.body;

        const puzzle = new Puzzle({
            question,
            options,
            correctAnswer
        });

        await puzzle.save();
        res.json(puzzle);
    } catch (error) {
        console.error("Error creating puzzle:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// ✅ Get a random unsolved puzzle for a user
router.get("/random", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const puzzle = await Puzzle.findOne({
            _id: { $nin: user.solvedPuzzles } // Exclude solved puzzles
        });

        if (!puzzle) return res.status(404).json({ message: "No new puzzles available" });

        res.json({
            id: puzzle._id,
            question: puzzle.question[user.language], // Fetch based on user-selected language
            options: puzzle.options[user.language]
        });
    } catch (error) {
        console.error("Error fetching puzzle:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Submit puzzle answer
router.post("/submit", authenticate, async (req, res) => {
    try {
        const { puzzleId, answer } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const puzzle = await Puzzle.findById(puzzleId);

        if (!puzzle) return res.status(404).json({ message: "Puzzle not found" });

        const isCorrect = puzzle.correctAnswer[user.language] === answer;

        // Add puzzle to solved list
        if (!user.solvedPuzzles.includes(puzzleId)) {
            user.solvedPuzzles.push(puzzleId);
            await user.save();
        }

        res.json({ correct: isCorrect });
    } catch (error) {
        console.error("Error submitting puzzle:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
