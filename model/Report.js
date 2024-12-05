/** @format */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const ReportSchema = mongoose.Schema(
  {
    pothole: {
      type: mongoose.Types.ObjectId,
      ref: "PothHoles",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Report", ReportSchema);
