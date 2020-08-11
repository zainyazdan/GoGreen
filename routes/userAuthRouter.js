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

const jwtModule = require('../config/jwtModule');



userAuthRouter.route('/login')
.post(async (req, res, next) => {

    if(!req.body.email || !req.body.password){
        return res.status(400).json({success: false,message:"Provides all parameters i.e. email and password"});
    }

    let user = await UserModel.findOne({email : req.body.email});

    if(!user){
        return res.status(409).json({success: false,message:"Invalid username or password"});
    }

    if(!user.verified){
      return res.status(409).json({success: false,message:"Please verify your email before login"});
    }
    
    let result = await bcryptModule.CompareHash(req.body.password, user.password);
    // console.log("reslult : "+ result);

    if(!result){
      return res.status(409).json({success: false,message:"Invalid username or password"});
    }
    
    let payload = {
      id: user._id,
      email: user.email
    };
    // console.log("payload: " , payload);
    // console.log("user._id: " , user._id);


    let token = await jwtModule.sign(payload, user._id);

    // console.log("token: " , token);


    res.cookie("Authorization", token);
    // res.cookie("zain", "Yazdan");

    res.status(200).send({
      success: true,
      message: "You are successfully loggedin",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });

    
});

// 
userAuthRouter.post("/test", async (req, res, next) => {
  
  console.log("cookie.Authorization: " , req.cookies.Authorization);
  console.log("cookie.zain: " , req.cookies.zain);

});



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
        email : req.body.email,
        verified: false
    });
    
    newUser.password = await bcryptModule.ComputeSaltHash(req.body.password);
    // console.log("newUser : ", newUser);

    
    let result = await UserModel.create(newUser);
    
    // console.log("result : ", result);


    let CLIENT_NAME = req.headers.origin;

    // if (process.env.NODE_ENV === "development") 
    {
        CLIENT_NAME = "http://localhost:3000/auth/user";
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

      await UserModel.findOneAndUpdate({email: req.params.email},
        {verified: true});

      res.status(200).json({success: true, message: "Email is successfully verified"});

    } catch (error) {
      console.error(error);
      res.status(500).send();
    }
});



module.exports = userAuthRouter;
