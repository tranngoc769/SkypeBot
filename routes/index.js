var express = require('express');
var router = express.Router();
var bodyparser = require('body-parser');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.send("get index");
});
router.post('/', function(req, res, next) {
    console.log('A post request');
    var payload = JSON.parse(req.body.payload);
    console.log(payload);
    res.send("post index");
});

module.exports = router;