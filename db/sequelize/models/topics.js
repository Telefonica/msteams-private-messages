'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Topics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Topics.belongsToMany(models.Conversations, {
        through: 'ConversationTopics',
        foreignKey: 'topicId',
        as: 'subscribers'
      })
    }
  }
  Topics.init(
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Topics'
    }
  )
  return Topics
}
