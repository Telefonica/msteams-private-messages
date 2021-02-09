'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Conversations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Conversations.belongsToMany(models.Topics, {
        through: 'ConversationTopics',
        foreignKey: 'conversationId',
        as: 'subscriptions'
      })
    }
  }
  Conversations.init(
    {
      user: DataTypes.STRING,
      conversationKey: DataTypes.STRING,
      conversationRef: DataTypes.JSON
    },
    {
      sequelize,
      modelName: 'Conversations'
    }
  )
  return Conversations
}
