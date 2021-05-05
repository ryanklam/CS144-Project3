var express = require('express');
var router = express.Router();
var client = require('../db');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt_key = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

/* GET login page */
router.get('/', function(req, res, next) {
    let username = req.query.username;
    let password = req.query.password;
    let redirect = req.query.redirect;
    res.render('login', {username : username, password : password, redirect : redirect});
});

router.post('/', function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let redirect = req.body.redirect;
    let blogposts = client.db('BlogServer');

    if (username === "" || password === "") {
        res.status(401).send('Missing username or password');
    } else {
        blogposts.collection('Users').findOne({username : username})
        .then((user) => {
            let pwdcheck = bcrypt.compareSync(password, user.password);
            if (pwdcheck) {
                let curtime = new Date();
                let sec = Math.floor(curtime/1000) + (2*60*60);
                let payload = {"exp": sec, "usr": username};
                let header = {"alg": "HS256", "typ": "JWT"};
                let token = jwt.sign(payload, jwt_key, {header : header});
                res.cookie("jwt", token, {expires: 0, httpOnly: true});
                if (redirect) {
                    res.redirect(302, redirect);
                } else {
                    res.status(200).send('Authentication successful');
                }
            } else {
                res.status(401);
                res.render('login', {username : null, password : null, redirect : redirect})
            }
        });
    }
});

module.exports = router;

