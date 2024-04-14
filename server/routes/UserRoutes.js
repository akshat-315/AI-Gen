const express = require("express");
const {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
} = require("../controllers/UserController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/user-profile", isAuthenticated, userProfile);
userRouter.get("/auth/check", isAuthenticated, checkAuth);

module.exports = userRouter;
