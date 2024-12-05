/** @format */

var express = require("express");
var router = express.Router();
const {
  CreatePotholes,
  findPothole,
  FindAllPothHole,
  findPothHoleSurrond,
} = require("../controller/PotholesController");
const { authentication } = require("../Middleware/authentication");
router.post("/create", authentication, CreatePotholes);
router.get("/findpothole", authentication, findPothole);
router.get("/findpotholearround", authentication, findPothHoleSurrond);
router.get("/findall", authentication, FindAllPothHole);
module.exports = router;
