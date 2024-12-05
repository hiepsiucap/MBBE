/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const SenSorDataSchema = new Schema({
  pothole: {
    type: mongoose.Types.ObjectId,
    ref: "PothHoles",
    required: true,
  },
  accelerometerX: {
    type: Number,
    required: true,
  },
  accelerometerY: {
    type: Number,
    required: true,
  },
  accelerometerZ: {
    type: Number,
    required: true,
  },
  currentKilometer: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("SensorData", SenSorDataSchema);
