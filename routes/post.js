var express = require('express');
var router = express.Router();
var client = require('../db');
const commonmark = require('commonmark');

const reader = new commonmark.Parser();
const writer = new commonmark.HtmlRenderer();


/* GET list of posts. */
router.get('/:username', function(req, res, next) {
  let username = req.params.username;
  let blogposts = client.db('BlogServer');
  let startid = req.query.start;
  let nextposturl = null;

  // If there is not optional start parameter
  if (username == null) {
    res.status(404).send('Not found');
  } else if (startid == undefined) {
    blogposts.collection('Posts').find({username: username}).limit(6).toArray()
    .then((posts) => {
      if (posts.length == 0) {
        res.status(404);
        res.send('No posts for this user')
      } else {
        // There are more than 5 posts to display
        if (posts.length == 6) {
          nextposturl = '/blog/' + username + '?start=' + posts[5].postid;
          posts = posts.slice(0, 5);
        }
        res.status(200);
        posts.forEach(function(part, index, array) {
          array[index].title = writer.render(reader.parse(array[index].title));
          array[index].body = writer.render(reader.parse(array[index].body));
        });
        res.render('post', { posts : posts, nextposturl : nextposturl });
      }
    })
  // If there is optional start parameter
  } else {
    startid = parseInt(startid);
    if (startid < 0 || isNaN(startid)) {
      res.status(400).send('Bad request');
    } else {
      blogposts.collection('Posts').find({username: username, postid: {$gte: startid}}).limit(6).toArray()
      .then((posts) => {
        if (posts.length == 0) {
          res.status(404);
          res.send('No posts for this user')
        } else {
          // There are more than 5 posts to display
          if (posts.length == 6) {
            nextposturl = '/blog/' + username + '?start=' + posts[5].postid;
            posts = posts.slice(0, 5);
          }
          res.status(200);
          posts.forEach(function(part, index, array) {
            array[index].title = writer.render(reader.parse(array[index].title));
            array[index].body = writer.render(reader.parse(array[index].body));
          })
          res.render('post', { posts : posts, nextposturl : nextposturl });
        }
      });
    }
  }
});

/* GET specific post. */
router.get('/:username/:postid', function(req, res, next) {
  let username = req.params.username;
  let postid = parseInt(req.params.postid);
  let nextposturl = null; 

  if (username == null || postid == NaN) {
    res.status(404).send('Not found');
  } else {
    let blogposts = client.db('BlogServer');
    blogposts.collection('Posts').findOne({username: username, postid: postid})
    .then((post) => {
      if (post == null) {
        res.status(404);
        res.send('Post not found')
      } else {
        res.status(200);
        post.title = writer.render(reader.parse(post.title));
        post.body = writer.render(reader.parse(post.body));
        const posts = [post];
        res.render('post', { posts : posts, nextposturl : nextposturl });
      }
    })
  }
});

module.exports = router;
