var FacebookTokenStrategy = require('passport-facebook-token');
var passport = require('passport');
var userModel = require('../models/UserModel');


console.log("facebook auth included");
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: '588026958526617',
  clientSecret: '2b901190a9fd91d9ba272262526990cd'
}, (accessToken, refreshToken, profile, done) => {
  userModel.findOne({facebookId: profile.id}, (err, user) => {
      if (err) {
          return done(err, false);
      }
      if (!err && user !== null) {
          return done(null, user);
      }
      else {

          console.log("profile : ", profile);

          user = new userModel({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstName = profile.name.givenName;
          user.lastName = profile.name.familyName;
          user.email = 'abcd';
          user.save((err, user) => {
              if (err)
                  return done(err, false);
              else
                  return done(null, user);
          })
      }
  });
}
));