import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Route to Verify Google ID Token from Android
router.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body; // Get the token sent from Android

        if (!idToken) {
            return res.status(400).json({ error: "ID Token is required" });
        }

        // Verify the ID Token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, // Must match your OAuth Client ID
        });

        const payload = ticket.getPayload();
        console.log("Google User:", payload); // Log user data

        // Create a JWT for your app
        const token = jwt.sign(
            { id: payload.sub, email: payload.email, name: payload.name },
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
