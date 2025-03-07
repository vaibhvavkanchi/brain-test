import mongoose from "mongoose";

const puzzleSchema = new mongoose.Schema({
    question: {
        en: { type: String, required: true },
        hi: { type: String, required: true }
    },
    options: {
        en: [{ type: String, required: true }],  // 4 Options in English
        hi: [{ type: String, required: true }]   // 4 Options in Hindi
    },
    correctAnswer: {
        en: { type: String, required: true },
        hi: { type: String, required: true }
    }
});

const Puzzle = mongoose.model("Puzzle", puzzleSchema);
export default Puzzle;

