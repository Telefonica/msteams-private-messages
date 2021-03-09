/**
 * @doc https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-actions
 */
const { CardFactory, MessageFactory, ActionTypes } = require('botbuilder')

/**
 * ```js
 * str = 'My name is ${name}, I am ${age}'
 * obj = {name: 'Jane', age: 23}
 * inject(str, obj)
 * =>
 * 'My name is Jane, I am 23
 * ```
 *
 * @see https://stackoverflow.com/a/55594573/1614677
 * @param {string} str
 * @param {any} obj
 */
const inject = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g])

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
 * @param {Types.IButton} template
 * @param {string[]} values
 */
const buttonListCardTemplate = (title, template, values) => {
  const cardActions = values.map(topic => {
    return {
      title: inject(template.title, { topic }),
      value: inject(template.value, { topic }),
      type: ActionTypes.ImBack
    }
  })
  const card = CardFactory.heroCard(title, null, cardActions)
  return asMessage(card)
}

/**
 * @param {Types.Config} config
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
    topicsCard: (/** @type {string[]} */ topics) =>
      buttonListCardTemplate(
        cards.topics.title,
        cards.topics.subscriptionButton,
        topics
      ),
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
  prepareCards,
  simpleCard
}
