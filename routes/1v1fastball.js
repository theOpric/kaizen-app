const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('1v1fastball', {
        "profileURL": req.user['profileFotoURL']
    });
});

module.exports = router;