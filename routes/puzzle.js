import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import Puzzle from "../models/Puzzle.js";

const router = express.Router();

// Get today's puzzle
router.get("/today", authenticate, async (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const puzzle = await Puzzle.findOne({ date: today });

    if (!puzzle) return res.status(404).json({ message: "No puzzle found today" });

    res.json(puzzle);
});

// Submit answer
router.post("/submit", authenticate, async (req, res) => {
    const { puzzleId, answer } = req.body;
    const puzzle = await Puzzle.findById(puzzleId);

    if (!puzzle) return res.status(404).json({ message: "Puzzle not found" });

    const isCorrect = puzzle.answer.toLowerCase() === answer.toLowerCase();
    res.json({ correct: isCorrect });
});

export default router;
