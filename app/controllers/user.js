/// <reference path="../../../typings/node/node.d.ts"/>
var express = require('express'),
  router = express.Router(),
  db = require('../models'),
  _ = require('underscore');

module.exports = function (app) {
  app.use('/user', router);
};

router.get('/:id', function(req, res){
  db.User.find(req.params.id).then(function(user){

    if(!user){
      var errorMessage = 'User not found.';
      console.error(errorMessage);
      res.statusCode = 401;
      res.end(JSON.stringify({
        message: errorMessage
      }));
      return;
    }

    var userData = user.get({
      plain: true
    });

    res.end(JSON.stringify(userData));
  }, function(error){

    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get user. Please try again later.'
    }));

  });
});

router.put('/:id', function(req, res){
  db.User.update(
    { bio: req.body.bio },
    { where: { id: req.body.id} }
  ).then(function(data){

    db.User.find(req.body.id).then(function(user){
      var userData = user.get({
        plain: true
      });

      res.end(JSON.stringify(userData));

    }, function(error){
      console.error(error.message);
      // User updated succesfully. Send the original request body back
      res.end(JSON.stringify(req.body));
    });

  }, function(error){
    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: error.message
    }));
  });
});

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

router.get('/:id/trip', function (req, res, next) {

  db.User
    .build({id: req.params.id})
    .getTrips()
    .then(function(trips){

      res.end(JSON.stringify(trips));

  }, function(error){

    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get user trips. Please try again later.'
    }));

  });
});

router.get('/:id/friend', function (req, res, next) {

  db.User
    .build({id: req.params.id})
    .getFacebookFriends({where: "(\"FacebookUser\".\"firstName\" like '"+req.query.term+"%' or \"FacebookUser\".\"lastName\" like '"+req.query.term+"%')"})
    .then(function(friends){

      res.end(JSON.stringify(friends));

  }, function(error){

    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to get friends. Please try again later.'
    }));

  });
});

router.post('/:id/invite', function (req, res, next) {
  db.User.find(req.params.id).then(function(user){
    user = user.get({
      plain: true
    });

    var userName = user.firstName +' '+user.lastName,
      content = 'Install Nomad '+
        'https://damp-spire-4043.herokuapp.com/download/MainActivity-debug.apk',
      subject = userName+' has invited you to '+req.body.trip.name+' via Nomad',
      config = require('../../config/config'),
      sendgridCredentials =  {
        userName: config.SENDGRID_USERNAME || process.env.SENDGRID_USERNAME,
        password: config.SENDGRID_PASSWORD || process.env.SENDGRID_PASSWORD
      },
      sendgrid  = require('sendgrid')(sendgridCredentials.userName, sendgridCredentials.password);

    sendgrid.send({
      to: req.body.email,
      from: user.email,
      subject: subject,
      text: content
    }, function(error, json) {
      if (error) {
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: 'Unable to send email. Please try again later.'
        }));
        return;
      }
      res.end();

      db.Invite.create({
        email: req.body.email,
        userId: req.params.id,
        tripId: req.body.trip.id,
        status: 'pending'
      }).then(function(data){
        res.end();
      }, function(error){
        console.error(error.message);
      });
    });

  }, function(error){
    console.error(error.message);
    res.statusCode = 500;
    res.end(JSON.stringify({
      message: 'Unable to send email. Please try again later.'
    }));
  });

});