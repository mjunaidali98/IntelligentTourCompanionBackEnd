var passport = require('passport');
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    console.log('JWT payload :' + jwt_payload);
    User.findOne({ _id: jwt_payload._id }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  })
);

exports.verifyUser = passport.authenticate('jwt', { session: false });
exports.verifyAdmin = (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) {
      return next(err);
    } else if (user.admin) {
      return next();
    } else {
      res.send('You are not allowed to perform this operation');
    }
  });
};
