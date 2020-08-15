var FacebookTokenStrategy = require('passport-facebook-token');
var passport = require('passport');
var UserModel = require('../models/UserModel');


// console.log("facebook auth included");


exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: '588026958526617',
  clientSecret: '2b901190a9fd91d9ba272262526990cd'
}, (accessToken, refreshToken, profile, done) => {
      // check if user already exists in our own db

      var tempUser = {
        facebookId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        username: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile._json.picture,
        verified: true
      };
      
      console.log('profile is: ', profile);

      console.log('User: ', tempUser);
      
      UserModel.findOne({facebookId: profile.id}).then((currentUser) => {
          if(currentUser){
              // already have this user
              // console.log('currentUser is: ', currentUser);
              // do something
              done(error, null);
          } else {
              // if not, create user in our db
              new UserModel({
                facebookId: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                username: profile.displayName,
                email: profile.emails[0].value | 'NILL',
                profilePicture: profile.photos[0].value,
                verified: true
              }).save().then((newUser) => {
                  // console.log('created new user: ', newUser);
                  // do something
                done(null, newUser);
              });
          }
      });

      
  })
);

