module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Invalid email format'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          args: 2,
          msg: 'First name must be at least 2 characters'
        },
        max: {
          args: 25,
          msg: 'First name cannot be greater than 25 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: {
          args: 2,
          msg: 'Last name must be at least 2 characters'
        },
        max: {
          args: 25,
          msg: 'Last name cannot be greater than 25 characters'
        }
      }
    },
    image: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    facebookUserId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    facebookAccessToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bio: {
      type: DataTypes.STRING,
      validate: {
        max: {
          args: 250,
          msg: 'Bio cannot be greater than 250 characters'
        }
      }
    }
  }, {
    classMethods: {
      associate: function (models) {
        User.hasMany(models.Interest, {as: 'Interests'});
        User.hasMany(models.Like, {as: 'Likes'});
        User.belongsToMany(models.Trip, {through: 'TripUser'});
        User.hasMany(models.FacebookUser, {as: 'FacebookFriends'})
      }
    }
  });

  return User;
};

