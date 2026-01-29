require("dotenv").config();
const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { createMailerFromEnv } = require("./config/mailer");

async function main() {
  const app = createApp();

  app.locals.mailer = createMailerFromEnv();

  await connectDB(process.env.MONGO_URI);

  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => console.log(`✅ API sur http://localhost:${port}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
