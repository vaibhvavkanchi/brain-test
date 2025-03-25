import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import Puzzle from "../models/Puzzle.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const puzzlesData = req.body; // Expecting an array of puzzle objects

        // Validate that puzzlesData is an array
        if (!Array.isArray(puzzlesData)) {
            return res.status(400).json({ message: "Request body must be an array of puzzles" });
        }

        // Map the incoming data to Puzzle documents, adding a date to each
        const puzzles = puzzlesData.map(({ question, options, correctAnswer }) => ({
            question,
            options,
            correctAnswer,
            date: new Date() // Explicitly set a date for each puzzle
        }));

        // Insert all puzzles into the database at once
        const savedPuzzles = await Puzzle.insertMany(puzzles);
        res.json(savedPuzzles);
    } catch (error) {
        console.error("Error creating puzzles:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

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
        const { puzzleId, answer, source } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const puzzle = await Puzzle.findById(puzzleId);

        if (!puzzle) return res.status(404).json({ message: "Puzzle not found" });

        if (!["question", "scratch", "spin"].includes(source)) {
            return res.status(400).json({ message: "Invalid source type" });
        }

        const isCorrect = puzzle.correctAnswer[user.language] === answer;

        // Add puzzle to solved list


        if (isCorrect) {
            // ✅ Update user points in MongoDB
            await User.findByIdAndUpdate(userId, { $inc: { points: 10, coins: 10 } });
            if (!user.solvedPuzzles.includes(puzzleId)) {
                user.solvedPuzzles.push(puzzleId);
                user.transactions.push({ points: 10, type: "earn", source: source, date: new Date() });
                await user.save();
            }
            return res.json({ correct: true, message: "Correct answer!", pointsEarned: 10 });
        } else {
            return res.json({ correct: false, message: "Wrong answer!" });
        }

    } catch (error) {
        console.error("Error submitting puzzle:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
