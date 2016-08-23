var express = require('express');
var router = express.Router();
var multer  = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var upload = multer({ dest: './uploads' });

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {
    title: 'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'Log in'
  });
});

router.post('/register', upload.single('profileimage'), function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password = req.body.password;
  var password2 = req.body.password2;

  console.log('file', req.file);

  // Check Image
  if (req.file) {
    console.log('Uploading file...');

    // File Info
    var profileImageOriginalName = req.file.originalname;
    var profileImageName = req.file.name;
    var profileImageMime = req.file.mimetype;
    var profileImagePath = req.file.path;
    var profileImageExt = req.file.extension;
    var profileImageSize = req.file.size;
  } else {
    // Set the default Image
    var profileImageName = 'noimage.png';
  }

  // Form Validate
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Not Valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  // Check for errors
  var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageName
    });

    // Create User
    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

    // Success message
    req.flash('success', 'You are now registered and may log in');

    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      console.log('Unknown user');
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        console.log('Invalid Password');
        return done(null, false, {message: 'Invalid Password'});
      }
    });
  });
}));

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login',
  failureFlash: 'Invalid username or password'
}), function(req, res, next) {
  console.log('Authentication Successful');
  req.flash('success', 'You are logged in');
  res.redirect('/');
});

router.get('/logout', function (req, res, next) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');

});

module.exports = router;
