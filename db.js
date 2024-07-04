const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const db = async () => {
  try {
    //const mongo_uri="mongodb://localhost:27017/trialmate";
    const mongo_uri =
      "mongodb+srv://mohammednasim2004:qvwKHJUtQ0S1hZRX@trialmate.fasasom.mongodb.net/?retryWrites=true&w=majority&appName=trialmate";
    if (mongo_uri) {
      await mongoose.connect(mongo_uri);
      console.log("Connected to database");
    }
  } catch (err) {
    throw new Error("Error to establish database connection:" + err);
  }
};

module.exports = { db };
