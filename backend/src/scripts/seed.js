require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Zone = require("../models/Zone");
const Sensor = require("../models/Sensor");
const Badge = require("../models/Badge");

async function run() {
  await connectDB(process.env.MONGO_URI);

  const adminEmail = "admin@cesi.fr";
  const securityEmail = "security@cesi.fr";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      firstName: "Admin",
      lastName: "CESI",
      email: adminEmail,
      role: "admin",
      passwordHash: await bcrypt.hash("admin123", 10)
    });
    console.log("✅ Admin créé:", adminEmail, "mdp: admin123");
  }

  let sec = await User.findOne({ email: securityEmail });
  if (!sec) {
    sec = await User.create({
      firstName: "Security",
      lastName: "CESI",
      email: securityEmail,
      role: "security",
      passwordHash: await bcrypt.hash("security123", 10)
    });
    console.log("✅ Security créé:", securityEmail, "mdp: security123");
  }

  let zone = await Zone.findOne({ name: "Entrée Principale" });
  if (!zone) {
    zone = await Zone.create({ name: "Entrée Principale", description: "Accès principal", entryPolicy: "badge+presence" });
    console.log("✅ Zone créée:", zone.name);
  }

  let sensor = await Sensor.findOne({ serial: "SENS-001" });
  if (!sensor) {
    sensor = await Sensor.create({ serial: "SENS-001", zoneId: zone._id, active: true });
    console.log("✅ Capteur créé:", sensor.serial);
  }

  let badge = await Badge.findOne({ uid: "BADGE-0001" });
  if (!badge) {
    badge = await Badge.create({ uid: "BADGE-0001", userId: sec._id, active: true });
    console.log("✅ Badge créé: BADGE-0001 -> security@cesi.fr");
  }

  console.log("✅ Seed terminé");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
