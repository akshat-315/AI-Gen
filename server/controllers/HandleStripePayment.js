const asyncHandler = require("express-async-handler");
const shouldRenewSubscription = require("../utils/shouldRenewSubscription");
const {
  calculateNextBillingDate,
} = require("../utils/calculateNextBillingDate");
const User = require("../models/User");
const Payment = require("../models/Payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const handleStripePayment = asyncHandler(async (req, res) => {
  const { amount, subscriptionPlan, paymentMethodId, address } = req.body;
  // Get the authenticated user
  const user = req?.user;
  console.log(user);

  try {
    const customer = await stripe.customers.create({
      name: user?.userName,
      address: {
        line1: address.line1,
        postal_code: address.postal_code,
        city: address.city,
        state: address.state,
        country: address.country,
      },
      email: user?.email,
      payment_method: paymentMethodId,
    });

    // Create a payment intent using the customer's ID
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
      customer: customer.id,
      // Metadata for tracking purposes
      metadata: {
        userId: user?._id?.toString(),
        userEmail: user?.email,
        userName: user?.userName,
        subscriptionPlan,
      },
      // Add product description
      description: `Subscription Plan: ${subscriptionPlan}`,
    });

    console.log(paymentIntent);
    res.json({
      clientSecret: paymentIntent?.client_secret,
      paymentId: paymentIntent?.id,
      metadata: paymentIntent?.metadata,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

//verify payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    console.log(paymentIntent);

    if (paymentIntent.status !== "succeeded") {
      //get the info metada
      const metadata = paymentIntent?.metadata;
      const subscriptionPlan = metadata?.subscriptionPlan;
      const userEmail = metadata?.userEmail;
      const userId = metadata?.userId;

      //find the user
      const userFound = await User.findById(userId);
      if (!userFound) {
        return res.status(404).json({
          status: "false",
          message: "User not found",
        });
      }
      //Get the payment details
      const amount = paymentIntent?.amount / 100;
      const currency = paymentIntent?.currency;
      const paymentId = paymentIntent?.id;

      //create the payment history
      const newPayment = await Payment.create({
        user: userId,
        email: userEmail,
        subscriptionPlan,
        amount,
        currency,
        status: "success",
        reference: paymentId,
      });
      //Check for the subscription plan

      if (subscriptionPlan === "Basic") {
        //update the user
        const updatedUser = await User.findByIdAndUpdate(userId, {
          subscriptionPlan,
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount: 50,
          subscriptionPlan: "Basic",
          $addToSet: { payments: newPayment?._id },
        });

        res.json({
          status: true,
          message: "Payment verified, user updated",
          updatedUser,
        });
      }
      if (subscriptionPlan === "Premium") {
        //update the user
        const updatedUser = await User.findByIdAndUpdate(userId, {
          subscriptionPlan,
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount: 100,
          subscriptionPlan: "Premium",
          $addToSet: { payments: newPayment?._id },
        });

        res.json({
          status: true,
          message: "Payment verified, user updated",
          updatedUser,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

//handle free subscription
const handleFreeSubscription = asyncHandler(async (req, res) => {
  const user = req?.user;
  console.log("Free plan", user);

  try {
    if (shouldRenewSubscription(user)) {
      //update the user account
      user.subscriptionPlan = "Free";
      user.monthlyRequestCount = 5;
      user.apiRequestCount = 0;
      user.nextBillingDate = calculateNextBillingDate();

      //create new payment ad save into db
      const newPayment = await Payment.create({
        user: user?._id,
        subscriptionPlan: "Free",
        amount: 0,
        status: "success",
        reference: Math.random().toString(36).substring(7),
        monthlyRequestCount: 0,
        currency: "inr",
      });
      user.payments.push(newPayment?._id);

      //save the user
      await user.save();

      //send the response
      res.json({
        status: "success",
        message: "Subscription plan updated successfully",
        user,
      });
    } else {
      return res.status(403).json({ error: "Subcription renewal not due yet" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = { handleStripePayment, handleFreeSubscription, verifyPayment };
