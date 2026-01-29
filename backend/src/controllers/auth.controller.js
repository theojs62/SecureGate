const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: String(user._id), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: { id: String(user._id), email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
  });
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
