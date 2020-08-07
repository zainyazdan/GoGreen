const mongoose = require("mongoose");

const verifyEmailSchema = mongoose.Schema({
  userEmail: {
    type: String,
    unique: true
  },
  verifyEmailToken: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  }
  //expire: moment.utc().add(config.tokenExpiry, 'seconds')
});

VerifyEmail = mongoose.model("VerifyEmail", verifyEmailSchema);
module.exports = VerifyEmail;
