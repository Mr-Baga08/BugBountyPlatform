

const express = require("express");
const Script = require("../models/ScriptModel");
const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const { script_name, category, script_code } = req.body;
        const newScript = new Script({
            activity: script_name,
            category,
            tools_technique: script_code,
        });
        const savedScript = await newScript.save();
        res.status(201).json({ message: "Script created", script: savedScript });
    } catch (error) {
        console.error("Error creating script:", error);
        res.status(500).json({ error: "Failed to create script" });
    }
});

router.get("/", async (req, res) => {
    try {
        const scripts = await Script.find();
        res.json(scripts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch scripts" });
    }
});

module.exports = router;