const e = require('express');
const jwt = require('jsonwebtoken');
const jwt_key = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

function auth(req, res, next) {
    let username_query = req.query.username;
    let username_post = req.body.username;
    let username = null;
    if (username_query) {
        username = username_query;
    } else {
        username = username_post;
    }
    let token = req.cookies.jwt;
    if (token == null) {
        res.status(401).send('Unauthorized');
    } else {
        let payload = jwt.verify(token, jwt_key);
        let curtime = Date.now();
        let cursec = Math.floor(curtime/1000);
        if (payload.usr != username || payload.exp < cursec) {
            res.status(401).send('Unauthorized');
        } else {
            next();
        }
    }
}

module.exports = auth;