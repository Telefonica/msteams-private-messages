const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Subscriptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Subscriptions.belongsTo(models.Topics, { foreignKey: 'topicId' })
      Subscriptions.belongsTo(models.Users, { foreignKey: 'userId' })
    }
  }
  Subscriptions.init(
    {
      userId: DataTypes.INTEGER,
      topicId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Subscriptions'
    }
  )
  return Subscriptions
}
