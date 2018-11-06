var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;

jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = ''; //Input your token key. And copy this file. finnaly, rename this file to passport.js

module.exports = jwtOptions;