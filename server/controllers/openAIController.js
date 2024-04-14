const asyncHandler = require("express-async-handler");
const axios = require("axios");
// const ContentHistory = require("../models/ContentHistory");
const User = require("../models/User");
const ContentHistory = require("../models/ContentHistory");

//----OpenAI Controller----

const openAIController = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt);
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response?.data?.choices[0].text?.trim();
    console.log(content);

    //create the history
    const newContent = await ContentHistory({
      user: req?.user?._id,
      content,
    });

    //push the content into the user
    const userFound = await User.findById(req?.user?._id);
    userFound.contentHistory.push(newContent?._id);

    //update the api request count
    userFound.apiRequestCount += 1;
    userFound.save();

    res.status(200).json(content);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  openAIController,
};
