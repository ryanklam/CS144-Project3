var express = require('express');
var router = express.Router();
let client = require('../db');

const jwt = require('jsonwebtoken');
const jwt_key = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

/* GET */
router.get('/posts', function(req, res, next) {
    let username = req.query.username;
    let postid = parseInt(req.query.postid);
    let blogposts = client.db('BlogServer');

    if (username == null) {
        res.status(400).send('Bad request');
    } else if (username && postid) {
        blogposts.collection('Posts').findOne({username : username, postid : postid})
        .then((post) => {
            if (post == null) {
                res.status(404).send('Post not found');
            } else {
                delete post.username;
                delete post._id;
                res.status(200).json(post);
            }
        });
    } else {
        blogposts.collection('Posts').find({username : username}).toArray()
        .then((posts) => {
            posts.forEach(function(part, index, array) {
                delete array[index].username;
                delete array[index]._id;
            });
            res.status(200).json(posts);
        });
    }
});

/* Delete */
router.delete('/posts', function(req, res, next) {
    let username = req.query.username;
    let postid = parseInt(req.query.postid);
    let blogposts = client.db('BlogServer');

    if (username == null || isNaN(postid)) {
        res.status(400).send('Bad request');
    } else {
        blogposts.collection('Posts').deleteOne({username : username, postid : postid})
        .then((result) => {
            if (result.deletedCount < 1) {
                res.status(404).send('Post not found');
            } else {
                res.status(204).send('Post deleted');
            }
        });
    }
});

/* POST */
router.post('/posts', function(req, res, next) {
    let username = req.body.username;
    let postid = parseInt(req.body.postid);
    let title = req.body.title;
    let body = req.body.body;
    let blogposts = client.db('BlogServer');

    if (username == null || isNaN(postid) || title == null || body == null) {
        res.status(400).send('Bad request');
    } else if (postid == 0) {
        blogposts.collection('Users').findOne({username : username})
        .then((user) => {
            if (user == null) {
                res.status(400).send('User not found');
            } else {
                let maxid = user.maxid + 1;
                let curtime = Date.now();
                let newpost = {postid: maxid, username: username, created: curtime, modified: curtime, title: title, body: body};
                try {
                    blogposts.collection('Posts').insertOne(newpost);
                } catch (e) {
                    console.log(e);
                }
                try {
                    blogposts.collection('Users').updateOne({username: username}, {$set: {maxid: maxid}});
                } catch (e) {
                    console.log(e);
                }
                let response = {postid : maxid, created : curtime, modified : curtime};
                res.status(201).json(response);
            }
        });
    } else if (postid > 0) {
        let curtime = Date.now();
        blogposts.collection('Posts').updateOne({username : username, postid : postid}, {$set: {title : title, body : body, modified : curtime}})
        .then((result) => {
            if (result.modifiedCount < 1) {
                res.status(404).send('Post not found');
            } else {
                let response = {modified: curtime};
                res.status(200).json(response);
            }
        });
    } else {
        res.status(400).send('Invalid post ID');
    }
});


module.exports = router;