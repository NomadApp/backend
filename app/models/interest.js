module.exports = function (sequelize, DataTypes) {

  var Interest = sequelize.define('Interest', {
    label: DataTypes.STRING
  }, {
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Interest.belongsToMany(models.User, {through: 'UserInterest'});
      }
    }
  });

  return Interest;
};

