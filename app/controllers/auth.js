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
          
          db.FacebookUser.create({
            firstName: facebookUser.firstName,
            lastName: facebookUser.lastName,
            facebookId: facebookUser.facebookUserId,
            picture: facebookUser.image
           }).then(function (data) {}, function (error) {
             console.error(error);
             console.error('Unable to save the user into facebook user table');
           });

          db.User.create(facebookUser)
            .then(function(user){

              res.end(JSON.stringify(_.extend({
                firstLogin: true
              }, user.get({
                plain: true
              }))));

              // Get facebook friendlist and store it

              facebookEndPointUrl = 'https://graph.facebook.com/v2.2/me/friends?'+
                'fields=first_name,last_name,email,picture&limit=1000'+
                '&access_token='+facebookAccessToken;

              request(facebookEndPointUrl, function(error, response, body){
                if(error){
                  console.error(error);
                  console.error('Unable to get facebook friends for access_token '+facebookAccessToken);
                  return;
                }

                var facebookFriendList = JSON.parse(response.body).data;

                if(facebookFriendList && facebookFriendList.length){
                  // upsert query
                  var sql = "WITH new_values (firstName, lastName, facebookId, picture) as ("+
                    "values";

                  facebookFriendList.forEach(function(friend, index){
                    sql += "('"+friend.first_name+"','"+friend.last_name+"','"+friend.id+"'";

                    if(friend.picture && friend.picture.data && !friend.picture.data.is_silhouette){
                      sql += ",'"+friend.picture.data.url+"'";
                    }

                    sql += ")";

                    if(index !== facebookFriendList.length - 1){
                      sql += ",";
                    }
                  });

                  sql += "),upsert as"+
                    "("+
                      "UPDATE FacebookUsers fbu"+
                      "SET firstName = nv.firstName,"+
                          "lastName = nv.lastName,"+
                          "facebookId = nv.facebookId,"+
                          "picture = nv.picture"+
                        "FROM new_values nv"+
                        "WHERE fbu.facebookId = nv.facebookId"+
                        "RETURNING fbu.*"+
                    ")"+

                    "INSERT INTO FacebookUsers (firstName, lastName, facebookId, picture)"+
                    "SELECT firstName, lastName, facebookId, picture"+
                    "FROM new_values"+
                    "WHERE NOT EXISTS ("+
                      "SELECT 1"+
                      "FROM upsert up"+
                      "WHERE up.id = new_values.id"+
                    ");";
                    
                    db.sequelize.query(sql);
                    
                    // Reset sql string to set it again for possible bulk insert
                    sql = '';
                    
                    var userObj;
                    
                    db.User.findAll({
                      where: {
                        facebookUserId: {
                          in: _.pluck(facebookFriendList, 'id')
                        }
                      }
                    }).then(function (data) {
                      data.forEach(function (user) {
                        userObj = user.get({plaing: true});
                        sql += "INSERT INTO FacebookUserUser (UserId, FacebookUserFacebookId) values('"+
                          userObj.id+"', '"+facebookUser.id+"'"
                          +"')";
                      });
                      
                      db.sequelize.query(sql);
                    }, function (error) {
                      console.error(error.message);
                      res.statusCode = 500;
                      res.end(JSON.stringify({
                        message: 'Unable find existing facebook friends.'
                      }));
                    });
                }

              });

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
