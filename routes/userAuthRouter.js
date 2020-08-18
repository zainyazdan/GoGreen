// node modules
var express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');


var userAuthRouter = express.Router();

// File modules
const UserModel = require('../models/UserModel');
const VerifyEmailModel = require('../models/VerifyEmailModel');

const bcryptModule = require('../config/bcryptModule');
const {sendVerifyEmailURL} = require('../actions/emailVerification');
const {verifyEmail} = require('../actions/emailVerification');
const jwtModule = require('../config/jwtModule');
const fileManager = require('../config/fileManager')
const auth = require('../middlewares/auth')
const verifyUser = passport.authenticate("jwt", { session: false });


userAuthRouter.route('/login')
.post( async (req, res, next) => {

  try {

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
      // console.log("reslult : "+ user);

      if(!result){
        return res.status(409).json({success: false,message:"Invalid username or password"});
      }



      let payload = {
        id: user._id
      };
      // console.log("payload: " , payload);
      // console.log("user._id: " , user._id);

      let token = await jwtModule.sign(payload, user._id);

      // console.log("token: " , token);
      // res.cookie("Authorization", token);
      // res.cookie("zain", "Yazdan");

      res.status(200).send({
        success: true,
        message: "You are successfully logged-in",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profilePicture: user.profilePicture,
        },
        token: token

      });

      
  } catch (error) {
    console.log(error);
  }
  


});

// 
userAuthRouter.get('/test', auth.verifyToken, verifyUser, (req, res, next) => {
  var origin = req.get('origin');


  // console.log("origin: " + origin);
  
  // console.log("req.headers.origin : " , req.headers);

  // console.log("cookie.Authorization: " , req.cookies.Authorization);
  // console.log("cookie.zain: " , req.cookies.zain);
  res.status(200).json({status: true, message: "Verification mail sent successfully. Now verify your email"});

});



userAuthRouter.route('/signup')
.post( fileManager.uploadProfileImage.single('imageFile'), async (req, res, next) => {

  try{

    // console.log("req.file : ", req.file);

    if(!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password){
        return res.status(400).json("Provides all parameters");
    }

    let user = await UserModel.findOne( {email : req.body.email} );

    if(user)
    {
        return res.status(409).json("User Already Exists");
    }

    if(req.body.password.length < 4)
    {
        return res.status(400).json("Password length should be greater than 4");
    }

    let newUser = new UserModel({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        email : req.body.email,
        profilePicture : req.file.path,
        verified: false
    });
    
    newUser.password = await bcryptModule.ComputeSaltHash(req.body.password);
    // console.log("newUser : ", newUser);

    
    let result = await UserModel.create(newUser);
    
    // console.log("result : ", result);


    let CLIENT_NAME = req.headers.origin;

    // if (process.env.NODE_ENV === "development") 
    {
        CLIENT_NAME = "http://localhost:" + process.env.PORt + "/auth/user";
    }
    
    let mailSent = await sendVerifyEmailURL(CLIENT_NAME, req.body.email);
    if (!mailSent)
      return res.send(
        "User created, but Unable to send verification email, try later"
    );
     
    res.status(200).json({status: true, message: "Verification mail sent successfully. Now verify your email"});

// 03218442769
// nadeem
      
  } catch (error) {
    console.log(error);
  }
  


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


userAuthRouter.get('/logout',auth.verifyToken, verifyUser, (req, res, next) => {

  try {

    if (req.user) {
      // res.cookies('Authorization', {expires: Date.now()});
      res.cookie("Authorization", "Removed", {expires: new Date()});
      res.status(200).json({success: true, message: 'You are successfully logged-out'})

    }
    else {
      var err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }

  } catch (error) {
    console.log(error);
  }

});



// update profile picture
userAuthRouter.route('/update_profile_picture')
.put(auth.verifyToken, verifyUser, fileManager.uploadProfileImage.single('imageFile') , async (req, res, next) => {
  try {

      // req.user = {};
      // req.user.id = '5f3853605701371f50291bfe';

      let user = await UserModel.findOne({ _id: req.user.id });
      // console.log("user : ", user);
      // console.log("user.profilePicture : ", user.profilePicture);

      
      // console.log("req.file.path : " + req.file.path);
      req.body.profilePicture = req.file.path;

      await fileManager.DeleteFile( user.profilePicture );

      let result = await UserModel.findByIdAndUpdate( 
        { _id: req.user.id} ,
        req.body    
      );

      // console.log("result : ", result);
      return res.status(200)
      .json({success:true, message:"Profile picture successfully updated"});

  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});



userAuthRouter.get('/login/facebook', passport.authenticate("facebook-token") , async (req, res) => {
  try {  
    if (req.user) 
    {
      // var token = authenticate.getToken({_id: req.user._id});
      // var token = 'temp token';


      // console.log("req.user : ", req.user);
      // res.statusCode = 200;
      // res.setHeader('Content-Type', 'application/json');
      // res.json({success: true, token: "TEMP TOKEN", status: 'You are successfully logged in!', user : req.user});


      let payload = {
        id: req.user._id
      };
      // console.log("payload: " , payload);
      // console.log("user._id: " , user._id);

      let token = await jwtModule.sign(payload, req.user._id);

      // console.log("token: " , token);
      // res.cookie("Authorization", token);
      // res.cookie("zain", "Yazdan");

      res.status(200).send({
        success: true,
        message: "You are successfully logged-in using Facebook",
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
        token: token
      });


    }
  } catch (error) {
      console.log(error);
  }
});


// auth with google+
userAuthRouter.get('/login/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
}));


// callback route for google to redirect to
userAuthRouter.get('/google/redirect',  passport.authenticate('google'), async (req, res) => {
  // res.send('you reached the redirect URI');

  try {  
    if (req.user) 
    {
      // var token = authenticate.getToken({_id: req.user._id});
      // var token = 'temp token';
      

      // console.log("req.user : ", req.user);
      // res.statusCode = 200;
      // res.setHeader('Content-Type', 'application/json');
      // res.json({success: true, token: "TEMP TOKEN", status: 'You are successfully logged in!', user : req.user});


      let payload = {
        id: req.user._id
      };
      // console.log("payload: " , payload);
      // console.log("user._id: " , user._id);

      let token = await jwtModule.sign(payload, req.user._id);

      // console.log("token: " , token);
      // res.cookie("Authorization", token);
      // res.cookie("zain", "Yazdan");

      res.status(200).send({
        success: true,
        message: "You are successfully logged-in using Google",
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
        token: token
      });
    }
  } catch (error) {
      console.log(error);
  }
});



module.exports = userAuthRouter;
