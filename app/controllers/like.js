var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/like', router);
};

router.get('/', function (req, res, next) {
  db.Like.findAll().then(function(data){
    res.end(JSON.stringify(data));
  }, function(error){
    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get likes. Please try again later.'
    }));
  });
});
