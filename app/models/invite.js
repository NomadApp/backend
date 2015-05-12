module.exports = function (sequelize, DataTypes) {

  var Invite = sequelize.define('Invite', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tripId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Invite.belongsTo(models.User, {through: 'UserInvite'});
        Invite.belongsTo(models.Trip, {through: 'TripInvite'});
      }
    }
  });

  return Invite;
};

