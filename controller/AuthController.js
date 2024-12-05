/** @format */

const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const User = require("../model/User");
const CreateJwtUser = require("../utils/CreateUserJwt");
const bcrypt = require("bcrypt");
const createUser = require("../utils/CreateUserJwt");
const Token = require("../model/Token");
const crypto = require("crypto");
const { attachCookieToReponse } = require("../utils/jwt");
const VerificationEmail = require("../utils/SendVerification");
const { getRandomIntegers } = require("../utils/GetVerifyToken");
const VerificationForgotEmail = require("../utils/SendResetPassword");
const CreateCookie = require("../utils/jwt");
require("dotenv").config();
const Login = async (req, res) => {
  console.log(req);
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomAPIError.BadRequestError(
      "Vui lòng nhập Email hoặc mật khẩu"
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomAPIError.BadRequestError("Email không tồn tại");
  }
  if (!user.IsVerification) {
    throw new CustomAPIError.BadRequestError("Tài khoản bạn chưa xác thực");
  }
  if (!(await user.compare(password))) {
    throw new CustomAPIError.AuthenticatedError(
      "Mật khẩu bạn bị sai vui lòng kiểm lại"
    );
  }
  const returnuser = await User.findOne({ email }).select(
    "-_id -password -IsVerification -birth -verficationToken -__v"
  );
  const tokenUser = CreateJwtUser(user);
  let RefreshToken = "";
  const ExistingToken = await Token.findOne({ user: user._id });
  if (ExistingToken) {
    const { isValid } = ExistingToken;
    if (!isValid) {
      throw new CustomAPIError.AuthenticatedError("Tài khoản bạn đã bị cấm");
    }
    RefreshToken = ExistingToken.refereshToken;
    console.log("hello");
    attachCookieToReponse({
      res,
      user: tokenUser,
      refreshToken: RefreshToken,
    });
    return res.status(StatusCodes.OK).json({ user: returnuser });
  }
  refreshToken = crypto.randomBytes(32).toString("hex");
  console.log(refreshToken);
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  await Token.create({
    refereshToken: refreshToken,
    ip,
    userAgent,
    user: user._id,
  });
  attachCookieToReponse({
    res,
    user: tokenUser,
    refreshToken,
  });
  return res.status(StatusCodes.OK).json({ user: returnuser });
};
const Register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const missingField = [
    { field: name, message: "Vui lòng nhập tên" },
    {
      field: email,
      message: "Vui lòng nhập email",
    },
    { field: password, message: "Vui lòng nhập mật khẩu" },
    { field: role, message: "Vui lòng nhập role" },
  ].find(({ ...field }) => !field);

  if (missingField) {
    throw new CustomAPIError.BadRequestError(missingField.message);
  }
  const FindUser = await User.findOne({ email: email });
  if (FindUser) {
    throw new CustomAPIError.BadRequestError(
      "Email đã tồn tại vui lòng thử với email khác"
    );
  }
  const VerificationToken = getRandomIntegers(4, 0, 9);
  const user = await User.create({
    name,
    email,
    password,
    role,
    verficationToken: VerificationToken,
    verificationTime: new Date(),
  });
  const origin = `${process.env.FRONT_END_API}/verify`;
  VerificationEmail({
    name: user.name,
    email: user.email,
    userId: user._id,
    VerificationToken: VerificationToken,
    origin: origin,
  });
  res.status(StatusCodes.OK).json({ user });
};
const SendBack = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.IsVerification) {
    throw new CustomAPIError.BadRequestError(
      "Tài khoản không tồn tại hoặc đã xác thực"
    );
  }
  const VerificationToken = getRandomIntegers(4, 0, 9);
  user.verficationToken = VerificationToken;
  user.verificationTime = new Date();
  await user.save();
  const origin = `${process.env.FRONT_END_API}/verify`;
  VerificationEmail({
    name: user.name,
    email: user.email,
    userId: user._id,
    VerificationToken: VerificationToken,
    origin: origin,
  });
  res.status(StatusCodes.OK).json({ msg: "Đã gửi lại mã xác nhận" });
};
const Logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};
const VerifyEmail = async (req, res) => {
  const { email, verifyToken } = req.body;
  const user = await User.findOne({ email, verficationToken: verifyToken });
  if (!user) {
    throw new CustomAPIError.AuthenticatedError(
      "Mã xác thực bị sai, vui lòng nhập lại "
    );
  }
  if (user) {
    const time = new Date() - user.verificationTime;
    if (time / 1000 > 120) {
      throw new CustomAPIError.BadRequestError(
        "Hết thời gian xác thực vui lòng thử lại"
      );
    }
    user.IsVerification = true;
    await user.save();
    res.status(StatusCodes.OK).json({
      msg: "Xác minh thành công",
    });
  }
};
const ForgotPassWord = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  console.log(user);
  if (user) {
    const verifyToken = getRandomIntegers(4, 0, 9);
    user.verficationToken = verifyToken;
    user.verificationTime = new Date();
    await user.save();
    const origin = `${process.env.FRONT_END_API}/verify`;
    VerificationForgotEmail({
      name: user.name,
      email: user.email,
      userId: user._id,
      VerificationToken: verifyToken,
      origin: origin,
    });
  }
  return res.status(StatusCodes.OK).json({ msg: "Kiêm tra email của bạn" });
};
const ResetPassword = async (req, res) => {
  const { verifyToken, email } = req.body;
  const user = await User.findOne({
    email,
    verficationToken: verifyToken,
  });
  if (!user) {
    throw new CustomAPIError.BadRequestError("Mã xác nhận thất bại");
  }
  if ((new Date() - user.verificationTime) / 1000 > 120) {
    throw new CustomAPIError.BadRequestError("Mã xác thực hết hạn");
  }
  user.verificationTime = new Date(new Date().getTime() + 60 * 10 * 1000);

  const final = await user.save();
  console.log(final);
  const tokenUser = CreateJwtUser(user);
  let RefreshToken = "";
  const ExistingToken = await Token.findOne({ user: user._id });
  if (ExistingToken) {
    const { isValid } = ExistingToken;
    if (!isValid) {
      throw new CustomAPIError.AuthenticatedError("Tài khoản bạn đã bị cấm");
    }
    RefreshToken = ExistingToken.refereshToken;
    console.log("hello");
    attachCookieToReponse({
      res,
      user: tokenUser,
      refreshToken: RefreshToken,
    });
    return res.status(StatusCodes.OK).json({
      msg: "Xác nhận mã xác thực thành công",
    });
  }
  refreshToken = crypto.randomBytes(32).toString("hex");
  console.log(refreshToken);
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  await Token.create({
    refereshToken: refreshToken,
    ip,
    userAgent,
    user: user._id,
  });
  attachCookieToReponse({
    res,
    user: tokenUser,
    refreshToken,
  });
  return res.status(StatusCodes.OK).json({
    msg: "Xác nhận mã xác thực thành công",
  });
};
const CheckAuthenticate = async (req, res) => {
  const user = await User.findById({ _id: req.user.User_id });
  return res.status(StatusCodes.OK).json({ user });
};
module.exports = {
  Login,
  Register,
  Logout,
  SendBack,
  ForgotPassWord,
  VerifyEmail,
  CheckAuthenticate,
  ResetPassword,
};
