module.exports = function (sequelize, DataTypes) {
  var Trip = sequelize.define('Trip', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        max: {
          args: 100,
          msg: 'Trip name cannot be greater than 100 characters'
        }
      }
    },
    startLocation: {
      type: DataTypes.TEXT
    },
    endLocation: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    }
  }, {
    classMethods: {
      associate: function(models){
        Trip.hasMany(models.User, {as: 'Members'});
      }
    }
  });

  return Trip;
};