/**
 * @doc https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-actions
 */
const { CardFactory, MessageFactory, ActionTypes } = require('botbuilder')
const { log } = require('../log')
const topicListTemplate = require('../../config/topic-list-template.json')

/**
 * @param {import('botbuilder').Attachment} card
 */
const asMessage = card => MessageFactory.attachment(card)

/**
 * @param {Types.ICard} param0
 */
const simpleCard = ({ title, text }) => {
  const card = CardFactory.heroCard(title, text)
  return asMessage(card)
}

/**
 * @param {string} title
 * @param {Types.IButton[]} buttons
 */
const buttonListCard = (title, buttons) => {
  const cardActions = buttons.map(({ title, value }) => ({
    title,
    value,
    type: ActionTypes.ImBack
  }))
  const card = CardFactory.heroCard(title, null, cardActions)
  return asMessage(card)
}

/**
 * @param {string} title
 * @param {Types.SubcriptionStatus[]} status
 * @param {Types.IButton} emptyButton
 */
const topicsCardBuilder = (title, status, emptyButton) => {
  if (status.length === 0) {
    return buttonListCard('Currently subscribed to none', [emptyButton])
  }
  const adaptiveCard = JSON.parse(JSON.stringify(topicListTemplate)) // deep copy
  const toogleItems = status.map(t => ({
    type: 'Input.Toggle',
    id: t.topic,
    title: t.topic,
    value: t.subscribed.toString()
  }))
  adaptiveCard.body[0].items[0].text = title
  adaptiveCard.body[0].items.push(...toogleItems)
  log.debug(JSON.stringify(adaptiveCard))
  const card = CardFactory.adaptiveCard(adaptiveCard)
  return asMessage(card)
}

/**
 * @param {Types.Config} param0
 */
const prepareCards = ({ cards }) => {
  return {
    welcomeCard: () => simpleCard(cards.welcome),
    unknownCard: () => simpleCard(cards.unknown),
    menuCard: () =>
      buttonListCard(cards.menu.title, [
        cards.menu.checkButton,
        cards.menu.listButton,
        cards.menu.resetButton
      ]),
    /**
     * @param {string} title
     * @param {Types.SubcriptionStatus[]} subscriptionStatus
     */
    topicsCard: (title, subscriptionStatus) =>
      topicsCardBuilder(title, subscriptionStatus, cards.menu.listButton),
    registeredKeywords: () => {
      return {
        check: cards.menu.checkButton.value,
        reset: cards.menu.resetButton.value,
        list: cards.menu.listButton.value
      }
    }
  }
}

module.exports = {
  prepareCards
}
