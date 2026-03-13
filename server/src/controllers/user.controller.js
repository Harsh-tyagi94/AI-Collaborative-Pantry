import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Room } from "../models/room.model.js";

const options = {
  httponly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. Validation
  // 2. Check for existing user
  // 3. Hash Password (Since it's not in the model)
  // 4. Create User

  const { username, email, password } = await req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password: hashedPassword,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = await req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate Token
  const accessToken = jwt.sign(
    { _id: user._id, email: user.email, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser.username, accessToken },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getUserHistory = asyncHandler(async (req, res) => {
  const history = await Room.find({
    $or: [{ admin: req.user._id }, { participants: req.user.username }],
  }).sort({ createdAt: -1 }); // Newest first

  return res
    .status(200)
    .json(new ApiResponse(200, history, "User history retrieved successfully"));
});

const getAboutMe = asyncHandler(async (req, res) => {
  const aboutme = await User.findOne(req.user?._id).select("-password");

  // console.log(aboutme);

  if (!aboutme) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, aboutme, "User details retrieved successfully"));
});

export { registerUser, loginUser, logoutUser, getUserHistory, getAboutMe };
