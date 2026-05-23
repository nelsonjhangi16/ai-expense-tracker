const express = require("express");
const Data    = require("../models/Data");
const protect = require("../middleware/auth");

const router = express.Router();

// ── GET ALL USER DATA ──
router.get("/", protect, async (req, res) => {
  try {
    let data = await Data.findOne({ userId: req.user._id });
    if (!data) {
      data = await Data.create({ userId: req.user._id });
    }
    res.json(data);
  } catch (err) {
    console.error("Get data error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── SAVE ALL USER DATA ──
router.put("/", protect, async (req, res) => {
  try {
    const { expenses, incomes, budgets } = req.body;

    const data = await Data.findOneAndUpdate(
      { userId: req.user._id },
      {
        expenses: expenses || [],
        incomes:  incomes  || [],
        budgets:  budgets  || [],
      },
      { new: true, upsert: true }
    );

    res.json(data);
  } catch (err) {
    console.error("Save data error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;