const express = require("express");
const userRouter = require("./routes/UserRoutes");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
require("dotenv").config();
require("./utils/connectDB")();
const errorHandler = require("./middlewares/ErrorMiddleware.js");
const openAIRouter = require("./routes/openAIRoutes.js");
const stripeRouter = require("./routes/StripeRoutes.js");
const User = require("./models/User.js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

//cron will run for every single Day
//cron for the trial period
cron.schedule("0 0 * * * *", async () => {
  console.log("This task runs every second");
  try {
    //get the current date
    const today = new Date();
    const updatedUser = await User.updateMany(
      {
        trialActive: true,
        trialExpires: { $lt: today },
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 5,
      }
    );
    console.log(updatedUser);
  } catch (error) {
    console.log(error);
  }
});

//Cron for the Free plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
  try {
    //get the current date
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Free",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//Cron for the Basic plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
  try {
    //get the current date
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Basic",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//Cron for the Premium plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
  try {
    //get the current date
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Premium",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});
//Middlewares
app.use(express.json()); //pass incoming json data
app.use(cookieParser()); //Pass the cookie automatically to the server
const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOption));

//Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/openAI", openAIRouter);
app.use("/api/v1/stripe", stripeRouter);

//ErrorHandler Middleware
app.use(errorHandler);

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
