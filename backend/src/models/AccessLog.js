const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    badgeUid: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    direction: { type: String, enum: ["IN", "OUT"], required: true },
    status: { type: String, enum: ["GRANTED", "DENIED"], required: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessLog", accessLogSchema);
