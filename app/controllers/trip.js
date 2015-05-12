var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/trip', router);
};

router.post('/', function (req, res, next) {
  db.Trip.create(req.body).then(function(trip){
    res.end(JSON.stringify(trip.get({
      plain: true
    })));
  }, function(error){
    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to create trip. Please try again later.'
    }));
  });
});

router.get('/:id', function (req, res, next) {
  db.Trip.find(req.params.id).then(function(trip){
    res.end(JSON.stringify(trip.get({
      plain: true
    })));
  }, function(error){
    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get trip. Please try again later.'
    }));
  });
});

router.put('/:id', function (req, res, next) {
  var body = req.body;
  if(body.startLocation){
    body.startLocation = JSON.stringify(body.startLocation);
  }

  if(body.endLocation){
    body.endLocation = JSON.stringify(body.endLocation);
  }

  db.Trip
    .update(body, {where: {id: body.id}})
    .then(function(){
      res.end();
    }, function(error){
      console.error(error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: 'Unable to get trip. Please try again later.'
    }));
  });
});