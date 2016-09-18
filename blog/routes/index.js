const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  var posts = req.db.get('posts');
  posts.find({}, {}, function (err, posts) {
    if (err) throw err;
    res.render('index', {
      posts: posts
    });
  });
});

module.exports = router;
