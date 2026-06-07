const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:      String,
      required:  true,
      minlength: 6,
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },
    settings: {
      currency:      { type: String,  default: "$"    },
      currencyCode:  { type: String,  default: "USD"  },
      monthlyBudget: { type: String,  default: ""     },
      notifications: { type: Boolean, default: true   },
      theme:         { type: String,  default: "dark" },
      flag:          { type: String,  default: "🇺🇸"  },
    },
    // ── PASSWORD RESET + EMAIL VERIFY ──
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date   },
  },
  { timestamps: true }
);

// ── HASH PASSWORD ──
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── COMPARE PASSWORD ──
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);