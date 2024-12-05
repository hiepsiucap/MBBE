/** @format */
const { StatusCodes } = require("http-status-codes");
const Report = require("../model/Report");
const PothHoles = require("../model/Potholes");
const GetTotalPothHoleUser = async (req, res) => {
  const { user } = req;
  const totalReport = await Report.find({
    user: user.User_id,
  }).populate("pothole");
  res.status(StatusCodes.OK).json({ total: totalReport.length });
};
const CreateReportPothHole = async (req, res) => {
  const { user, potholeId, image } = req;
  const pothHole = await PothHoles.findById({ _id: potholeId });
  const Report = await Report.create({
    user,
    pothole: pothHole,
    content: "updateImage",
  });
  pothHole.imagePath = image;
  await pothHole.save();
};
module.exports = { GetTotalPothHoleUser, CreateReportPothHole };
