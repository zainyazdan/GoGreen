const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      // required: true
    },
    password: {
      type: String,
    },
    facebookId: {
      type: String
    },
    googleId: {
      type: String
    },
    username: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
}, {
    timestamps: true
});


var Users = mongoose.model('User', userSchema);
module.exports = Users;


