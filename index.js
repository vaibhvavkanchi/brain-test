import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import puzzleRoutes from "./routes/puzzle.js";
// import "./config/passport.js"; // Import Passport config

dotenv.config();
const app = express();

app.use(cors());
app.use(passport.initialize());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Hello from Node.js on Vercel!");
});
// Routes
app.use("/auth", authRoutes);
app.use("/puzzle", puzzleRoutes);

const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => console.log(err));
