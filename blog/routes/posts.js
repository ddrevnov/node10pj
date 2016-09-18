const express = require('express');
const router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'public/img/uploads/'});

router.get('/add', function(req, res, next) {
  var categories = req.db.get('categories');

  categories.find({}, {}).then(function (categories) {
    res.render('addpost', {
      title: "Add post",
      categories: categories
    });
  });

});

router.get('/show/:id', function(req, res, next) {
  var posts = req.db.get('posts');

  posts.findById(req.params.id, function (err, post) {
    if (err) next(err);
    res.render('show', {
      post: post
    });
  });
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // Get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  if (req.file) {
    console.log(req.file);
    var mainImageOriginalName = req.file.originalname;
    var mainImageName = req.file.filename;
    var mainImageMime = req.file.mimetype;
    var mainImagePath = req.file.path;
    var mainImageExt = req.file.extension;
    var mainImageSize = req.file.size;
  } else {
    var mainImageName = 'noimage.png';
  }

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check errors
  var errors = req.validationErrors();

  if (errors) {
    res.render('addpost', {
      errors: errors,
      title: title,
      body: body
    });
  } else {
    var posts = req.db.get('posts');
    posts.insert({
      title: title,
      body: body,
      category: category,
      date: date,
      author: author,
      mainimage: mainImageName
    }, function (err, post) {
      if (err) {
        res.send('Не можем создать пост');
        return;
      }
      req.flash('success', 'Post Submitted');
      res.location('/');
      res.redirect('/');
    });
  }
});

router.post('/addcomment', upload.single('mainimage'), function(req, res, next) {
  // Get form values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentdate = new Date();

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not formatted correctly').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check errors
  var errors = req.validationErrors();

  if (errors) {
    var posts = req.db.get('posts');
    posts.findById(postid, function (err, post) {
      res.render('show', {
        errors: errors,
        post: post
      });
    });
  } else {
    var comment = {
      name: name,
      email: email,
      body: body,
      commentdate: commentdate
    };
    var posts = req.db.get('posts');

    posts.update({
      _id: postid
    }, {
      $push: {
        comments: comment
      }
    }, function (err, doc) {
      if (err) {
        throw err;
      } else {
        req.flash('success', 'Comment added');
        res.location('/posts/show/' + postid);
        res.redirect('/posts/show/' + postid);
      }
    });
  }
});

module.exports = router;
