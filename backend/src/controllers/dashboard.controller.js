const Alert = require("../models/Alert");
const AccessLog = require("../models/AccessLog");
const Zone = require("../models/Zone");
const User = require("../models/User");

async function overview(req, res) {
  const [openAlerts, todayAccess, zones] = await Promise.all([
    Alert.countDocuments({ status: "OPEN" }),
    AccessLog.countDocuments({ createdAt: { $gte: startOfDay(new Date()) } }),
    Zone.find().lean()
  ]);

  // top zones today
  const topZonesAgg = await AccessLog.aggregate([
    { $match: { createdAt: { $gte: startOfDay(new Date()) } } },
    { $group: { _id: "$zoneId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const zoneMap = new Map(zones.map(z => [String(z._id), z.name]));
  const topZones = topZonesAgg.map(z => ({ zoneId: String(z._id), zoneName: zoneMap.get(String(z._id)) || "?", count: z.count }));

  res.json({
    kpis: {
      openAlerts,
      todayAccess
    },
    topZones
  });
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function presence(req, res) {
  // Dernier log par user -> IN = présent
  const logs = await AccessLog.aggregate([
    { $match: { status: "GRANTED", userId: { $ne: null } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        lastDirection: { $first: "$direction" },
        lastZoneId: { $first: "$zoneId" },
        lastAt: { $first: "$createdAt" }
      }
    }
  ]);

  const present = logs.filter(l => l.lastDirection === "IN");
  const userIds = present.map(p => p._id);
  const users = await User.find({ _id: { $in: userIds } }).select("firstName lastName email role").lean();
  const zones = await Zone.find().lean();

  const userMap = new Map(users.map(u => [String(u._id), u]));
  const zoneMap = new Map(zones.map(z => [String(z._id), z]));

  res.json(
    present.map(p => ({
      user: userMap.get(String(p._id)),
      zone: zoneMap.get(String(p.lastZoneId)),
      lastAt: p.lastAt
    }))
  );
}

async function accessLogs(req, res) {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const logs = await AccessLog.find()
    .populate("userId", "firstName lastName email role")
    .populate("zoneId", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(logs);
}

async function alerts(req, res) {
  const status = req.query.status;
  const q = status ? { status } : {};
  const data = await Alert.find(q)
    .populate("zoneId", "name")
    .populate("relatedUserId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.json(data);
}

async function ackAlert(req, res) {
  const id = req.params.id;
  const userId = req.user.sub;
  const alert = await Alert.findByIdAndUpdate(
    id,
    { status: "ACK", ackBy: userId, ackAt: new Date() },
    { new: true }
  ).lean();

  res.json(alert);
}

async function closeAlert(req, res) {
  const id = req.params.id;
  const alert = await Alert.findByIdAndUpdate(id, { status: "CLOSED" }, { new: true }).lean();
  res.json(alert);
}

module.exports = { overview, presence, accessLogs, alerts, ackAlert, closeAlert };
