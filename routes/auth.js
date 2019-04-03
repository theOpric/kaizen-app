const express = require('express');
const router = express.Router();
const passportGoogle = require('../auth/Google');

router.get('/google', passportGoogle.authenticate(
    'google',
    {
        scope: ['profile']
    }
));

router.get('/google/callback', passportGoogle.authenticate(
    'google',
    {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/select');
    }
);
module.exports = router;