const express = require("express");
const router = express.Router();
const controller = require("../controller/insurance_controller");

router.post("/upload/excel", controller.uploadXlsx);
router.post("/upload/excel/worker", controller.uploadXlsxWorkerThread);
router.get("/search/policy/:userId", controller.getPolicyInfo);
router.get("/aggregate/policy/:userId", controller.getAggregatedPolicyInfo);

module.exports = router;
