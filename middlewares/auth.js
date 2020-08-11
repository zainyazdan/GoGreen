
const jwt = require('../config/jwtModule');
const userModel = require('../models/UserModel');
const passport = require("passport");

var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;


module.exports.verifyToken = async function(req, res, next)
{
  let token = req.cookies.Authorization;
  // console.log("auth token : " + token);
  if(!token)
  {
    return res.status(401).send('Unauthorized access');
  }

  let result = await jwt.verify(token);
  // console.log("result jwt : " + result);
  
  if(!result)
  {
    return res.status(401).send('Unauthorized access');
  }

  next();
}



module.exports.verifyUser = async function(req, res, next)
{


  // console.log("Req.cookies.user : " + req.cookies.user);

  // if(!req.cookies.user)
  // {
  //   return res.status(401).send('Your are not logged in..!!');
  // }
  

  var opts = {};
  // opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.jwtFromRequest = req.cookies.Authorization;
  // opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("bearer");
  opts.secretOrKey = "1234-5678";
  // opts.issuer = "mingaproject.com";
  // opts.audience = "mingaproject.com";
  opts.ignoreExpiration = true;
  opts.ignoreNotBefore = true;
  // opts.algorithm = ["RS256"];


  console.log("opts : ", opts);

  // var result = await passport.use(new JwtStrategy(opts));
  // console.log("result passport-jwt : ", result);

  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {

      console.log("jwt_payload : ",jwt_payload);

      // if (
      //   jwt_payload.role === "user" ||
      //   jwt_payload.role === "admin" ||
      //   jwt_payload.role === "communityleader"
      // ) {
      //   // console.log(jwt_payload);
      //   User.findOne({ _id: jwt_payload.id }, function (err, user) {
      //     if (err) {
      //       return done(err, false);
      //     }`  `
      //     if (user) {
      //       return done(null, user);
      //     } else {
      //       return done(null, false);
      //       // or you could create a new account
      //     }
      //   });
      // } else {
      //   return done(err, false);
      // }


    })
  );


  // next();
}



