const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    entryPolicy: { type: String, enum: ["badgeOnly", "badge+presence"], default: "badge+presence" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Zone", zoneSchema);
