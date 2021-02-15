const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Users.belongsToMany(models.Topics, {
        through: 'Subscriptions',
        foreignKey: 'UserId',
        as: 'subscriptions'
      })
    }
  }
  Users.init(
    {
      user: DataTypes.STRING,
      conversationKey: DataTypes.STRING,
      conversationRef: DataTypes.JSON
    },
    {
      sequelize,
      modelName: 'Users'
    }
  )
  return Users
}
