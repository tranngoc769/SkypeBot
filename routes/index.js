var express = require('express');
var titlecase = require('title-case');
var router = express.Router();
var os = require("os");
const host = 'http://355f0bffd0ba.ngrok.io'
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
                host: host,
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
        readHTMLFile(__dirname + '/template/commit.html', function(err, data) {
            var template = handlebars.compile(data);
            var add = "";
            var removed = "";
            var modified = "";
            var name = null;
            var username = null;
            var msg = null;
            var timesp = null;

            if (payload.head_commit != null) {
                name = payload.head_commit.committer.name;
                username = payload.head_commit.committer.username;
                msg = payload.head_commit.message;
                timesp = payload.head_commit.timestamp;
                payload.head_commit.added.forEach(element => {
                    add += element + " ";
                });
                payload.head_commit.removed.forEach(element => {
                    removed += element + " ";
                });
                payload.head_commit.modified.forEach(element => {
                    modified += element + " ";
                });
            }
            var replacements = {
                host: host,
                head_commit: payload.head_commit,
                reponame: payload.repository.name,
                repoName: payload.repository.name,
                repoUrl: payload.repository.html_url,
                owner: payload.repository.owner.name,
                title: "New pushed commits",
                ref: payload.ref,
                name: name,
                username: username,
                msg: msg,
                timesp: timesp,
                list_add: add,
                list_update: modified,
                list_delete: removed,
                commits: payload.commits,
                pusher: payload.pusher.name,
                senderID: payload.sender.id,
                senderName: payload.sender.login,
                senderimg: payload.sender.avatar_url,
                senderurl: payload.sender.html_url,
            };
            mailOptions['html'] = template(replacements);
            let date_ob = new Date();
            mailOptions['subject'] = "New pushing from " + titlecase.titleCase(payload.pusher.name) + " to repo : " + titlecase.titleCase(payload.repository.name) + " [" + date_ob.getDate().toString() + "-" + ((date_ob.getMonth() + 1) % 12).toString() + " " + date_ob.getHours().toString() + ":" + date_ob.getMinutes().toString() + "]";
            sendMail(mailOptions);
        });
    }
    if (type == "create" || type == 'delete') {
        readHTMLFile(__dirname + '/template/ref.html', function(err, data) {
            var template = handlebars.compile(data);
            var master_branch = null;
            var description = null;
            if (type == 'create') {
                master_branch = payload.master_branch;
                description = payload.description;
            }
            var replacements = {
                action: type.toUpperCase(),
                host: host,
                reponame: payload.repository.name,
                repoName: payload.repository.name,
                repoUrl: payload.repository.html_url,
                owner: payload.repository.owner.login,
                title: titlecase.titleCase(type) + " " + payload.ref_type,
                ref: payload.ref,
                ref_type: titlecase.titleCase(payload.ref_type),
                master_branch: master_branch,
                description: description,
                senderID: payload.sender.id,
                senderName: payload.sender.login,
                senderimg: payload.sender.avatar_url,
                senderurl: payload.sender.html_url,
            };
            mailOptions['html'] = template(replacements);
            let date_ob = new Date();
            mailOptions['subject'] = type.toUpperCase() + " " + payload.ref_type + " from repo : " + titlecase.titleCase(payload.repository.name) + " [" + date_ob.getDate().toString() + "-" + ((date_ob.getMonth() + 1) % 12).toString() + " " + date_ob.getHours().toString() + ":" + date_ob.getMinutes().toString() + "]";
            sendMail(mailOptions);
        });
    }
}

function checkTypePayload(payload) {
    if (payload.hasOwnProperty('ref') && payload.hasOwnProperty('head_commit') && !payload.hasOwnProperty('ref_type:') && payload.hasOwnProperty('commits') && payload.hasOwnProperty('before')) {
        return 'pushes';
    }
    if (payload.hasOwnProperty('action') && payload.hasOwnProperty('member') && payload.hasOwnProperty('repository') && payload.hasOwnProperty('sender')) {
        return 'member';
    }
    if (payload.hasOwnProperty('ref') && payload.hasOwnProperty('ref_type') && payload.hasOwnProperty('master_branch') && payload.hasOwnProperty('description') && payload.hasOwnProperty('repository') && !payload.hasOwnProperty('organization')) {
        return 'create';
    }
    if (payload.hasOwnProperty('ref') && payload.hasOwnProperty('ref_type') && !payload.hasOwnProperty('master_branch') && !payload.hasOwnProperty('description') && payload.hasOwnProperty('repository')) {
        return 'delete';
    }
}
/* GET home page. */
router.get('/', function(req, res, next) {
    readHTMLFile(__dirname + '/template/test.html', function(err, data) {
        var test = 123;
        var arr = [{
            "distinct": true,
            "message": "Test array 1",
        }, {
            "distinct": true,
            "message": "Test array 2",
        }, {
            "distinct": true,
            "message": "Test array 3",
        }, {
            "distinct": true,
            "message": "Test array 4",
        }, {
            "distinct": true,
            "message": "Test array 5",
        }];
        var template = handlebars.compile(data);
        var replacements = {
            title: 'TEST PAGE',
            arr: arr,
            test: test
        };
        var html = template(replacements);
        res.send(html);
    });
});
router.post('/', function(req, res, next) {
    console.log('A post request');
    var payload = JSON.parse(req.body.payload);
    createMessages(payload);
    res.send("post index");
});

module.exports = router;