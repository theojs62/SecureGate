const { z } = require("zod");
const Badge = require("../models/Badge");
const AccessLog = require("../models/AccessLog");
const Sensor = require("../models/Sensor");
const PresenceEvent = require("../models/PresenceEvent");
const Zone = require("../models/Zone");
const { createAlert } = require("../services/alertService");

const badgeScanSchema = z.object({
  badgeUid: z.string().min(1),
  zoneId: z.string().min(1),
  direction: z.enum(["IN", "OUT"])
});

async function badgeScan(req, res) {
  const parsed = badgeScanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { badgeUid, zoneId, direction } = parsed.data;

  const badge = await Badge.findOne({ uid: badgeUid }).lean();
  const zone = await Zone.findById(zoneId).lean();
  if (!zone) return res.status(404).json({ error: "Zone not found" });

  let status = "DENIED";
  let reason = "Badge inconnu";
  let userId = null;

  if (badge) {
    userId = badge.userId;
    if (!badge.active) {
      reason = "Badge inactif";
    } else {
      status = "GRANTED";
      reason = "OK";
    }
  }

  const log = await AccessLog.create({
    badgeUid,
    userId,
    zoneId,
    direction,
    status,
    reason
  });

  // Alerte si refus
  if (status === "DENIED") {
    await createAlert({
      mailer: req.app.locals.mailer,
      type: "DENIED_BADGE",
      severity: "MEDIUM",
      zoneId,
      relatedUserId: userId,
      relatedBadgeUid: badgeUid,
      message: `Badge refusé en zone "${zone.name}" (${reason})`
    });
  }

  res.status(201).json(log);
}

const presenceSchema = z.object({
  sensorSerial: z.string().min(1),
  detected: z.boolean()
});

async function presence(req, res) {
  const parsed = presenceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { sensorSerial, detected } = parsed.data;

  const sensor = await Sensor.findOne({ serial: sensorSerial }).lean();
  if (!sensor) return res.status(404).json({ error: "Sensor not found" });

  await Sensor.updateOne({ _id: sensor._id }, { $set: { lastSeenAt: new Date() } });

  const pe = await PresenceEvent.create({
    sensorId: sensor._id,
    zoneId: sensor.zoneId,
    detected
  });

  // Si présence détectée -> vérifier badge récent GRANTED IN dans la même zone
  if (detected) {
    const windowMs = Number(process.env.PRESENCE_BADGE_WINDOW_MS || 120000);
    const since = new Date(Date.now() - windowMs);

    const recentGranted = await AccessLog.findOne({
      zoneId: sensor.zoneId,
      status: "GRANTED",
      direction: "IN",
      createdAt: { $gte: since }
    }).sort({ createdAt: -1 }).lean();

    if (!recentGranted) {
      const zone = await Zone.findById(sensor.zoneId).lean();
      await createAlert({
        mailer: req.app.locals.mailer,
        type: "NO_BADGE_PRESENCE",
        severity: "HIGH",
        zoneId: sensor.zoneId,
        relatedUserId: null,
        relatedBadgeUid: null,
        message: `Présence détectée en zone "${zone?.name || "?"}" sans badge valide récent`
      });
    }
  }

  res.status(201).json(pe);
}

module.exports = { badgeScan, presence };
