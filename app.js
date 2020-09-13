var express = require('express');
var path = require('path');
const port = 8080;
const ngrok = require('ngrok');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(port, (err) => {
    if (err) return console.log(`Something bad happened`);

    ngrok.connect(port, function(err, url) {
        if (err) {
            console.log(`Something bad happened at ${err}`);
            return;
        }
        console.log(`Node.js local server is publicly-accessible at ${url}`);
    });
    console.log(`Node.js server listening on ${port}`);
});

module.exports = app;