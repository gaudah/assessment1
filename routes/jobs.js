const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.post("/new", controller.createJob);
router.get("/file/:fileName", controller.getJob);

module.exports = router;
