var express = require('express');
var router = express.Router();

/* GET members page. */
router.get('/', ensureAuthentificated, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

function ensureAuthentificated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/users/login');
}

module.exports = router;
