/** @format */
const PothHoles = require("../model/Potholes");
const SensorData = require("../model/SensorData");
const Report = require("../model/Report");
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const CreatePotholes = async (req, res) => {
  const { user } = req;
  const {
    latitude,
    longitude,
    severity,
    accelerometerX,
    accelerometerY,
    accelerometerZ,
    currentKilometer,
  } = req.body;

  const poth = await PothHoles.create({
    latitude,
    longitude,
    severity,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  });
  if (poth) {
    const sensorData = await SensorData.create({
      pothole: poth._id,
      accelerometerX,
      accelerometerY,
      accelerometerZ,
      currentKilometer,
    });
    const report = await Report.create({
      pothole: poth._id,
      user: user.User_id,
      content: "Create PothHole",
    });
    return res.status(StatusCodes.OK).json({ report, sensorData, poth });
  }
  return res.status(StatusCodes.CONFLICT).json({ msg: "Không thể tạo poth" });
};
const findPothole = async (req, res) => {
  const { longitude, latitude, distance } = req.query;
  const pothHoles = await PothHoles.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], distance / 6378.1],
      },
    },
  });
  return res.status(StatusCodes.OK).json({ pothHoles });
};
const findPothHoleSurrond = async (req, res) => {
  const { longitude, latitude } = req.query;
  const pothHoles = await PothHoles.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], 5 / 6378100],
      },
    },
  });
  return res.status(StatusCodes.OK).json({ PothHoles: pothHoles });
};
const FindAllPothHole = async (req, res) => {
  const CreateReportPothHole = await PothHoles.find({});
  return res
    .status(StatusCodes.OK)
    .json({ totalpothole: CreatePotholes.length });
};

module.exports = {
  CreatePotholes,
  findPothole,
  FindAllPothHole,
  findPothHoleSurrond,
};
