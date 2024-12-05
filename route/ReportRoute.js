/** @format */

var express = require("express");
var router = express.Router();
const {
  GetTotalPothHoleUser,
  CreateReportPothHole,
} = require("../controller/ReportController");
const { authentication } = require("../Middleware/authentication");
router.get("/gettotal", authentication, GetTotalPothHoleUser);
router.post("/reportpothole", authentication, CreateReportPothHole);
module.exports = router;
