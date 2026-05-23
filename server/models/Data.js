const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    expenses: { type: Array, default: [] },
    incomes:  { type: Array, default: [] },
    budgets:  { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Data", DataSchema);