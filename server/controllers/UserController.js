const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

//Registration
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    //Validate
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please fill out all the fields");
    }

    //Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error(`User with the email: ${email} already exists!`);
    }

    //Hash the Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Add the date trial will end
    newUser.trialExpires = new Date(
      new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
    );

    // Save the user
    await newUser.save();
    res.json({
      status: true,
      message: "User Registered successfully",
      user: {
        username,
        email,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //Check for user email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password!");
  }

  //check if password is valid
  const isMatch = await bcrypt.compare(password, user?.password);
  if (!isMatch) {
    throw new Error("Invalid email or password!");
  }

  //Generate Token using JWT
  const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  console.log(token);
  //set the token into cookie (http only)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, //1 day
  });

  //send the response
  res.json({
    status: "success",
    message: "Login success",
    _id: user?._id,
    username: user?.username,
    email: user?.email,
  });
});

//Logout
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json({ message: "Logout successfully" });
});

//Profile
const userProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id).select("-password");
  if (user) {
    res.status(200).json({
      status: "success",
      user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Check User Auth Status
const checkAuth = asyncHandler(async (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
  if (decoded) {
    res.json({
      isAuthenticated: true,
    });
  } else {
    res.json({
      isAuthenticated: false,
    });
  }
});

module.exports = {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
};
