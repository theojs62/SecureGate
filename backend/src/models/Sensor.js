const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
  {
    serial: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["presence"], default: "presence" },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    active: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sensor", sensorSchema);
