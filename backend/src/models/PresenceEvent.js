const mongoose = require("mongoose");

const presenceEventSchema = new mongoose.Schema(
  {
    sensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor", required: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    detected: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PresenceEvent", presenceEventSchema);
