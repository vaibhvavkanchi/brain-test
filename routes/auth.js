import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js"; // Import User model

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Route to Verify Google ID Token and Store User
router.post("/google", async (req, res) => {
    try {
        const { idToken, language = "en" } = req.body; // Accept language from request

        if (!idToken) {
            return res.status(400).json({ error: "ID Token is required" });
        }

        // Verify the ID Token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, // Must match your OAuth Client ID
        });

        const payload = ticket.getPayload();
        console.log("Google User:", payload);

        // Check if user exists in DB, else create a new one
        let user = await User.findOne({ googleId: payload.sub });

        if (!user) {
            user = new User({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                solvedPuzzles: [],
                language // Store user's selected language
            });
            await user.save();
        }

        // Create a JWT token for your app
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, language: user.language },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, message: "Login successful!" });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(401).json({ error: "Invalid Google ID Token" });
    }
});

export default router;
