const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/security.middleware");
const monitoringController = require("../controllers/monitoring.controller");

// Only admins can see security traces
router.get("/trace", auth, authorize("admin"), monitoringController.getSecurityTrace);
router.get("/anomalies", auth, authorize("admin"), monitoringController.getAnomalies);

module.exports = router;
