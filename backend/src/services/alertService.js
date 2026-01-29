const Alert = require("../models/Alert");
const Zone = require("../models/Zone");
const User = require("../models/User");

async function sendAlertEmail(mailer, alertDoc) {
  if (!mailer) {
    console.log("📧 (SMTP non configuré) Email alerte:", alertDoc.type, alertDoc.message);
    return;
  }

  const zone = await Zone.findById(alertDoc.zoneId).lean();
  const user = alertDoc.relatedUserId ? await User.findById(alertDoc.relatedUserId).lean() : null;

  const subject = `[CESI] Alerte ${alertDoc.severity} - ${alertDoc.type}`;
  const text =
`Alerte: ${alertDoc.type}
Gravité: ${alertDoc.severity}
Zone: ${zone?.name || "?"}
Utilisateur: ${user ? `${user.firstName} ${user.lastName} (${user.email})` : "N/A"}
Badge UID: ${alertDoc.relatedBadgeUid || "N/A"}
Message: ${alertDoc.message}
Statut: ${alertDoc.status}
Date: ${alertDoc.createdAt}`;

  await mailer.sendMail({
    from: process.env.ALERT_EMAIL_FROM,
    to: process.env.ALERT_EMAIL_TO,
    subject,
    text
  });
}

async function createAlert({ mailer, type, severity, zoneId, relatedUserId, relatedBadgeUid, message }) {
  const alert = await Alert.create({
    type,
    severity,
    zoneId,
    relatedUserId: relatedUserId || null,
    relatedBadgeUid: relatedBadgeUid || null,
    message,
    status: "OPEN"
  });

  // email best effort
  try {
    await sendAlertEmail(mailer, alert);
  } catch (e) {
    console.error("📧 Erreur email:", e.message);
  }

  return alert;
}

module.exports = { createAlert };
