var express = require('express');
var titlecase = require('title-case');
var router = express.Router();
var bodyparser = require('body-parser');
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var nodeMailerUser = 'githubreporter@zohomail.com';
var fs = require('fs');
const collaborators = ['hocmai6@gmail.com', 'tnquang.769@gmail.com', 'ant.king.edu@gmail.com']
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'tnquang.769@gmail.com',
        pass: 'quang7699'
    }
});
var readHTMLFile = function(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

function sendMail(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Send maill successful")
        }
    });

}

function createMessages(payload) {
    var type = checkTypePayload(payload);
    var mailOptions = {
        from: `Github Reporter <${nodeMailerUser}>`,
        to: collaborators
    };
    if (type == "member") {
        readHTMLFile(__dirname + '/template/members.html', function(err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                repourl: payload.repository.html_url,
                title: titlecase.titleCase(payload.action) + " Collabrator",
                action: payload.action.toUpperCase(),
                reponame: payload.repository.name,
                newID: payload.member.id,
                newName: payload.member.login.toUpperCase(),
                senderID: payload.sender.id,
                senderName: payload.sender.login,
                newmemberimg: payload.member.avatar_url,
                newmemberurl: payload.member.html_url,
                senderimg: payload.sender.avatar_url,
                senderurl: payload.sender.html_url,
            };
            mailOptions['html'] = template(replacements);
            let date_ob = new Date();
            mailOptions['subject'] = titlecase.titleCase(payload.action) + " collabrator " + titlecase.titleCase(payload.member.login) + " [" + date_ob.getDay().toString() + "-" + date_ob.getMonth().toString() + " " + date_ob.getHours().toString() + ":" + date_ob.getMinutes().toString() + "]";
            sendMail(mailOptions);
        });
    }

    if (type == "pushes") {

    }
}

function checkTypePayload(payload) {
    if (payload.hasOwnProperty('commits') && payload.hasOwnProperty('commits') && payload.hasOwnProperty('before')) {
        return 'pushes';
    }
    if (payload.hasOwnProperty('action') && payload.hasOwnProperty('member') && payload.hasOwnProperty('repository') && payload.hasOwnProperty('sender')) {
        return 'member';
    }
    if (payload.hasOwnProperty('ref') && payload.hasOwnProperty('ref_type') && payload.hasOwnProperty('master_branch') && payload.hasOwnProperty('description') && payload.hasOwnProperty('repository') && payload.hasOwnProperty('organization') && payload.hasOwnProperty('installation')) {
        return 'create';
    }
    if (payload.hasOwnProperty('ref') && payload.hasOwnProperty('ref_type') && !payload.hasOwnProperty('master_branch') && !payload.hasOwnProperty('description') && payload.hasOwnProperty('repository') && payload.hasOwnProperty('organization') && payload.hasOwnProperty('installation')) {
        return 'delete';
    }

}
/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(titlecase.titleCase('sd dsdssd'));
    res.send("get index");
});
router.post('/', function(req, res, next) {
    console.log('A post request');
    var payload = JSON.parse(req.body.payload);
    console.log(payload);
    createMessages(payload);
    res.send("post index");
});

module.exports = router;