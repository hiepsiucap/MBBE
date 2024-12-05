/** @format */
var express = require("express");
var router = express.Router();
const {
  GetCurrentUser,
  UpdateUser,
  ChangePassword,
  AddKilometer,
} = require("../controller/UserController");
const { authentication } = require("../Middleware/authentication");

/* GET users listing. */
router.get("/currentuser", authentication, GetCurrentUser);
router.patch("/updateinfo", authentication, UpdateUser);
router.patch("/changepassword", authentication, ChangePassword);
router.patch("/addkilometer", authentication, AddKilometer);
module.exports = router;
