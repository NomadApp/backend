var express = require('express'),
  router = express.Router(),
  db = require('../models'),
  request = require('request'),
  _ = require('underscore');

module.exports = function (app) {
  app.use('/auth', router);
};

router.post('/login', function (req, res, next) {
  var facebookAccessToken = req.body.facebookToken,
    facebookEndPointUrl = 'https://graph.facebook.com/v2.2/me?'+
    'fields=id,email,picture,first_name,last_name'+
    '&access_token='+facebookAccessToken;

  // From the access token received in the query string, call the Facebook API to get the user email
  request(facebookEndPointUrl, function(error, response, body){
    if(error){
      console.error(error);
      res.statusCode = error.statusCode || 502;
      res.end(JSON.stringify({
        message: 'Unable to get facebook user details. Please try agian later.'
      }));
    }else{
      var facebookUser = JSON.parse(response.body);
      console.info('Facebook user details');
      console.info(facebookUser);
      // Query the DB to see if this is a returning user
      db.User.find({
        where: {
          email: facebookUser.email
        }
      }).then(function (user) {
        // If a user is found, return the user data to the client
        if(user){
          res.end(JSON.stringify(user));
        }else{
          // Normalize field names
          facebookUser.firstName = facebookUser.first_name;
          facebookUser.lastName = facebookUser.last_name;
          facebookUser.image = !facebookUser.picture.data.is_silhouette ? facebookUser.picture.data.url : '';
          facebookUser.facebookUserId = facebookUser.id;
          facebookUser.facebookAccessToken = facebookAccessToken;

          delete facebookUser.id;

          db.User.create(facebookUser)
            .then(function(user){

              res.end(JSON.stringify(_.extend({
                firstLogin: true
              }, user.get({
                plain: true
              }))));

            }, function(error){
              console.error(error.message);
              res.statusCode = 500;
              res.end(JSON.stringify({
                message: 'Unable create user. Please try again later.'
              }));
            });
        }

      }, function(error){
        console.error(error.message);
        // If no user is found, create a new user in the DB
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: 'Unable lookup user. Please try again later.'
        }));
      });
    }

  });

});
