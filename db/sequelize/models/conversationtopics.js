'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ConversationTopics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      ConversationTopics.belongsTo(models.Topics, { foreignKey: 'topicId' })
      ConversationTopics.belongsTo(models.Conversations, {
        foreignKey: 'conversationId'
      })
    }
  }
  ConversationTopics.init(
    {
      conversationId: DataTypes.INTEGER,
      topicId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'ConversationTopics'
    }
  )
  return ConversationTopics
}
