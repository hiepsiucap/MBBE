/** @format */

const User = require("../model/User");
const CustomAPIError = require("../errors");
const StatusCodes = require("http-status-codes");
const GetCurrentUser = async (req, res) => {
  const { user } = req;
  const returnuser = await User.findById({ _id: user.User_id }).select(
    " -verficationToken -IsVerification -password -verificationTime -__v"
  );
  if (!returnuser)
    throw new CustomAPIError.AuthenticatedError("Không tìm thấy thông tin");
  return res.status(StatusCodes.OK).json({ returnuser });
};
const UpdateUser = async (req, res) => {
  const { user } = req;
  const { update } = req.body;
  console.log(update);
  if (update.password || update.email) {
    throw new CustomAPIError.BadRequestError("Không thay đổi đc ");
  }
  const returnUser = await User.findByIdAndUpdate(user.User_id, update, {
    new: true,
  }).select(
    " -verficationToken -IsVerification -password -verificationTime -__v"
  );
  return res.status(StatusCodes.OK).json({ returnUser });
};
const ChangePassword = async (req, res) => {
  const { user } = req;
  const { newpassword, password } = req.body;
  const currentuser = await User.findOne({ _id: user.User_id });
  console.log(currentuser.verificationTime, new Date());
  if (!newpassword) {
    throw new CustomAPIError.BadRequestError("Mật khẩu mới ko đc cung cấp");
  }
  if (!password && currentuser.verificationTime < new Date()) {
    throw new CustomAPIError.BadRequestError("Mật khẩu cũ ko đươc cung cấp");
  }
  if (password) {
    const check = await currentuser.compare(password);
    if (!check) throw new CustomAPIError.BadRequestError("Mật khẩu cũ bị sai ");
  }
  currentuser.password = newpassword;
  await currentuser.save();
  return res.status(StatusCodes.OK).json({ msg: "Đổi mật khẩu thành công" });
};
const AddKilometer = async (req, res) => {
  const { user } = req;
  const { totalkilometer } = req.body;
  const currUser = await User.findOne({ _id: user.User_id });
  currUser.totalkilometer += totalkilometer;
  await currUser.save();
  return res
    .status(StatusCodes.OK)
    .json({ msg: "Cập nhật kilometer thành công" });
};

module.exports = { GetCurrentUser, AddKilometer, UpdateUser, ChangePassword };
