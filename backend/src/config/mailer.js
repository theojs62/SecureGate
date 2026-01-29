const nodemailer = require("nodemailer");

function createMailerFromEnv() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Si pas configuré -> mode "console"
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

module.exports = { createMailerFromEnv };
