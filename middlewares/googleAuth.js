var FacebookTokenStrategy = require('passport-facebook-token');
var passport = require('passport');
var UserModel = require('../models/UserModel');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
 

// passport.use(new GoogleStrategy({
//     clientID: '1021847502731-ua2e1qqsvege8rlsaf9f8vjiqg93t5ie.apps.googleusercontent.com',
//     clientSecret: 'OiDtWEHw-uMoY3HktxV36vPx',
//     callbackURL: '/auth/user/google/redirect'
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     UserModel.findOrCreate({ googleId: profile.id }, function (err, user) {

//         console.log("Google profile : ", profile);

//         return cb(err, user);
//     });
//   }
// ));



passport.use(
  new GoogleStrategy({
      // options for google strategy
          clientID: '1021847502731-ua2e1qqsvege8rlsaf9f8vjiqg93t5ie.apps.googleusercontent.com',
          clientSecret: 'OiDtWEHw-uMoY3HktxV36vPx',
          callbackURL: '/auth/user/google/redirect'
  }, (accessToken, refreshToken, profile, done) => {
      // check if user already exists in our own db

      var tempUser = {
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        username: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile._json.picture,
        verified: true
      };
      console.log('profile is: ', profile);

      console.log('User: ', tempUser);
      
      UserModel.findOne({googleId: profile.id}).then((currentUser) => {
          if(currentUser){
              // already have this user
              // console.log('currentUser is: ', currentUser);
              // do something
              done(error, null);
          } else {
              // if not, create user in our db
              new UserModel({
                googleId: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                username: profile.displayName,
                email: profile.emails[0].value,
                profilePicture: profile._json.picture,
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


// sub: '108046251894724407900',
// name: 'Zain Yazdan',
// given_name: 'Zain',
// family_name: 'Yazdan',
// picture: 'https://lh5.googleusercontent.com/-LmpxLia8eoE/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucnFV54I3nG6U9DUm3M17h_z28p_gg/photo.jpg',
// locale: 'en'
// }
