// node modules
var express = require('express');
const mongoose = require('mongoose');


var userAuthRouter = express.Router();
// File modules
const UserModel = require('../models/UserModel');
const VerifyEmailModel = require('../models/VerifyEmailModel');

const bcryptModule = require('../config/bcryptModule');
const {sendVerifyEmailURL} = require('../actions/emailVerification');
const {verifyEmail} = require('../actions/emailVerification');


userAuthRouter.route('/signup')
.post(async (req, res, next) => {

    if(!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password)
    {
        return res.status(400).json("Provides all parameters");
    }

    let user = await UserModel.findOne({email : req.body.email});

    if(user){
        return res.status(409).json("User Already Exists");
    }

    if(req.body.password.length < 4)
    {
        return res.status(400).json("Password length should be greater than 4");
    }

    let newUser = new UserModel({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email
    });
    
    newUser.password = await bcryptModule.ComputeSaltHash(req.body.password);
    // console.log("newUser : ", newUser);

    
    let result = await UserModel.create(newUser);
    
    // console.log("result : ", result);


    let CLIENT_NAME = req.headers.origin;

    // if (process.env.NODE_ENV === "development") 
    {
        CLIENT_NAME = "http://localhost:3000";
    }
    
    let mailSent = await sendVerifyEmailURL(CLIENT_NAME, req.body.email);
    if (!mailSent)
      return res.send(
        "User created, but Unable to send reset email, try later"
    );

    
    res.status(200).json({status: true, message: "Verification mail sent successfully. Now verify your email"});
});






// email verification
userAuthRouter.get("/emailverification/:email/:token", async (req, res, next) => {
    try {
      let user = await UserModel.findOne({ email: req.params.email });
      if (user.verified === true) {
        return res.status(600).send("Email already verified");
      }
  
      let verified = await verifyEmail(req.params.email, req.params.token);
      if (!verified) return res.status(401).send("Invalid Url");
  
      // let user = await User.findOne({ email: req.params.email });
      // return res.send(user);
      user.verified = true;
      await user.save();
      // result = result.toJSON();
      // result = _.omit(result, ["password", "__v"]);
  
      await VerifyEmailModel.deleteMany({ userEmail: req.params.email });
      res.status(200).json({status: true, message: "Email is successfully verified"});

    } catch (error) {
      console.error(error);
      res.status(500).send();
    }
  });









module.exports = userAuthRouter;
