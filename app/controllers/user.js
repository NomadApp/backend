var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/user', router);
};

router.post('/:id/interest', function (req, res, next) {

  db.User.find(req.params.id).then(function(user){

    db.Interest.findAll({
      where: {
        id: req.body.interestIds
      }
    }).then(function(interests){

      user.setInterests(interests).then(function(data){
        //TODO: Add this in  a transaction and roll it back if it errors out
        var interestsCount = interests.length, interest;
        for (var i = 0; i < interestsCount; i++) {
          interest = interests[i];
          interest.addUser(user);
        }

        res.statusCode = 204;
        res.end();

      }, function(error){
        console.error(error.message);
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: 'Unable to save interests. Please try again later.'
        }));
      });

    }, function(error){

      console.error(error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: 'Unable to get interests. Please try again later.'
      }));

    });
  }, function(error){

    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get user. Please try again later.'
    }));

  });
});

router.post('/:id/like', function (req, res, next) {

  db.User.find(req.params.id).then(function(user){

    db.Like.findAll({
      where: {
        id: req.body.likeIds
      }
    }).then(function(likes){

      user.setLikes(likes).then(function(data){
        //TODO: Add this in  a transaction and roll it back if it errors out
        var likesCount = likes.length, like;
        for (var i = 0; i < likesCount; i++) {
          like = likes[i];
          like.addUser(user);
        }

        res.statusCode = 204;
        res.end();

      }, function(error){
        console.error(error.message);
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: 'Unable to save likes. Please try again later.'
        }));
      });

    }, function(error){

      console.error(error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: 'Unable to get likes. Please try again later.'
      }));

    });
  }, function(error){

    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get user. Please try again later.'
    }));

  });
});