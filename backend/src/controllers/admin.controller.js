const { z } = require("zod");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Badge = require("../models/Badge");
const Zone = require("../models/Zone");
const Sensor = require("../models/Sensor");

const userCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "security"]).default("security")
});

async function listUsers(req, res) {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
  res.json(users);
}

async function createUser(req, res) {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  const { firstName, lastName, email, password, role } = parsed.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) return res.status(409).json({ error: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, passwordHash, role });
  res.status(201).json({ id: String(user._id) });
}

async function deleteUser(req, res) {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

// Badges
const badgeCreateSchema = z.object({
  uid: z.string().min(1),
  userId: z.string().min(1),
  active: z.boolean().optional()
});

async function listBadges(req, res) {
  const badges = await Badge.find().populate("userId", "firstName lastName email role").sort({ createdAt: -1 }).lean();
  res.json(badges);
}

async function createBadge(req, res) {
  const parsed = badgeCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const badge = await Badge.create({
    uid: parsed.data.uid,
    userId: parsed.data.userId,
    active: parsed.data.active ?? true
  });
  res.status(201).json(badge);
}

async function setBadgeActive(req, res) {
  const { active } = req.body;
  const badge = await Badge.findByIdAndUpdate(req.params.id, { active: !!active }, { new: true });
  res.json(badge);
}

// Zones
const zoneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  entryPolicy: z.enum(["badgeOnly", "badge+presence"]).optional()
});

async function listZones(req, res) {
  const zones = await Zone.find().sort({ name: 1 }).lean();
  res.json(zones);
}

async function createZone(req, res) {
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const zone = await Zone.create(parsed.data);
  res.status(201).json(zone);
}

// Sensors
const sensorSchema = z.object({
  serial: z.string().min(1),
  zoneId: z.string().min(1),
  active: z.boolean().optional()
});

async function listSensors(req, res) {
  const sensors = await Sensor.find().populate("zoneId", "name").sort({ createdAt: -1 }).lean();
  res.json(sensors);
}

async function createSensor(req, res) {
  const parsed = sensorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const sensor = await Sensor.create({
    serial: parsed.data.serial,
    zoneId: parsed.data.zoneId,
    active: parsed.data.active ?? true
  });
  res.status(201).json(sensor);
}

module.exports = {
  listUsers, createUser, deleteUser,
  listBadges, createBadge, setBadgeActive,
  listZones, createZone,
  listSensors, createSensor
};
