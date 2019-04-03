//GOOGLE//
const GOOGLE_LOGIN_CLIENT_ID = '549266309510-vbahgh8kbcki4nruhajuf1ldkipvfci8.apps.googleusercontent.com';
const GOOGLE_LOGIN_SECRET_ID = '6_YLOiL2X4_G3ZYiZkm02wxM';
const GOOGLE_LOGIN_CALLBACK_URL = '/auth/google/callback';
//GOOGLE//
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

//models

const User = require('../models/users');

passport.use(
    new GoogleStrategy({
        clientID: GOOGLE_LOGIN_CLIENT_ID,
        clientSecret: GOOGLE_LOGIN_SECRET_ID,
        callbackURL: GOOGLE_LOGIN_CALLBACK_URL
    },
        ((accessToken, refreshToken, profile, done) => {
            const data = profile._json;
            User.findOrCreate(
                {
                    'googleID': data.sub
                },
                {
                    googleID: data.sub,
                    name: data.given_name,
                    surname: data.family_name,
                    profileFotoURL: data.picture,
                    fbOnline: 0,
                    fbSearch: 0,
                    fbMatch: '',
                    socketID: ''
                },
                (err, user) => {
                    return done(err, user);
                }
            );
        })
    ));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});
module.exports = passport;
