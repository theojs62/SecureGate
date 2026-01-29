const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const ctrl = require("../controllers/dashboard.controller");

router.use(requireAuth, requireRole("admin", "security"));

router.get("/overview", ctrl.overview);
router.get("/presence", ctrl.presence);
router.get("/access-logs", ctrl.accessLogs);
router.get("/alerts", ctrl.alerts);
router.post("/alerts/:id/ack", ctrl.ackAlert);
router.post("/alerts/:id/close", ctrl.closeAlert);

module.exports = router;
