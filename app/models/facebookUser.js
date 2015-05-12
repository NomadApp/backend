module.exports = function (sequelize, DataTypes) {
  var FacebookUser = sequelize.define('FacebookUser', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING
    },
    facebookId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    picture: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models){
        FacebookUser.belongsToMany(models.User, {through: 'FacebookUserUser'});
      }
    }
  });

  return FacebookUser;
};