var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('A get request');
    res.send("get index");
});
router.post('/', function(req, res, next) {
    console.log('A post request');
    res.send("post index");
});

module.exports = router;