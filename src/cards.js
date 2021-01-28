/**
 * @doc https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-actions
 */
const { CardFactory, MessageFactory, ActionTypes } = require('botbuilder')

/**
 * @param {import('botbuilder').Attachment} card
 */
const asMessage = card => MessageFactory.attachment(card)

/**
 * @param {{title: string, text: string}} param0
 */
const simpleCard = ({ title, text }) => {
  const card = CardFactory.heroCard(title, text)
  return asMessage(card)
}

/**
 * @param {import('botbuilder').CardAction[]} cardActions
 * @param {{title: string, value: string}} param1
 */
const addDefaultButton = (cardActions, { title, value }) => {
  cardActions.push({
    title,
    value,
    type: ActionTypes.ImBack
  })
}

/**
 * @param {Types.Config} config
 */
const prepareCards = ({ cards }) => {
  const menuCard = () => {
    const subscriptionButtons = cards.menuCard.subscriptionButtons
    const cardActions = subscriptionButtons.map(({ title, value }) => ({
      title,
      value,
      type: ActionTypes.ImBack
    }))
    addDefaultButton(cardActions, cards.menuCard.checkButton)
    addDefaultButton(cardActions, cards.menuCard.resetButton)
    const title = cards.menuCard.title
    const menuCard = CardFactory.heroCard(title, null, cardActions)
    return asMessage(menuCard)
  }

  const registeredKeywords = () => {
    const menu = cards.menuCard
    return {
      check: menu.checkButton.value,
      reset: menu.resetButton.value,
      subscriptions: menu.subscriptionButtons.map(({ value }) => value)
    }
  }

  return {
    menuCard,
    registeredKeywords,
    welcomeCard: () => simpleCard(cards.welcomeCard),
    unknownCard: () => simpleCard(cards.unknownCard)
  }
}

module.exports = {
  prepareCards
}
