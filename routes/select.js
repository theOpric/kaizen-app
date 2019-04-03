const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('select');
});

module.exports = router;