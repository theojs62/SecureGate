const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const { badgeScan, presence } = require("../controllers/events.controller");

// Protégé (dans un vrai système, ce serait une clé “device”)
router.use(requireAuth);

router.post("/badge-scan", badgeScan);
router.post("/presence", presence);

module.exports = router;
