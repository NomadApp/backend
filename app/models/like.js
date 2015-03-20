
module.exports = function (sequelize, DataTypes) {

  var Like = sequelize.define('Like', {
    label: DataTypes.STRING
  }, {
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Like.belongsToMany(models.User, {through: 'UserLike'});
      }
    }
  });

  return Like;
};

