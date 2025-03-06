import mongoose from "mongoose";

const puzzleSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    hints: [{ type: String }]
});

const Puzzle = mongoose.model("Puzzle", puzzleSchema);
export default Puzzle;
