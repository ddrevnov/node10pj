const express = require('express');
const router = express.Router();

router.get('/add', function(req, res, next) {
  res.render('addcategory', {
    title: 'Add category'

  });
});

router.get('/show/:category', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');

  posts.find({category: req.params.category}, {}).then(function (posts) {
    res.render('index', {
      title: req.params.category,
      posts: posts
    });
  });
});

router.post('/add', function(req, res, next) {
  // Get form values
  var title = req.body.title;

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();

  // Check errors
  var errors = req.validationErrors();

  if (errors) {
    res.render('addcategory', {
      errors: errors,
      title: title
    });
  } else {
    var categories = req.db.get('categories');
    categories.insert({
      title: title
    }, function (err, category) {
      if (err) {
        res.send('Не можем создать категорию');
      }
      req.flash('success', 'Category Submitted');
      res.location('/');
      res.redirect('/');
    });
  }
});

module.exports = router;
