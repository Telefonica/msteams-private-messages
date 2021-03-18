# message format 🔡

Both `/api/v1/notify` & `/api/v1/broadcast` needs `message` as parameter. This message accepts 3 different formats:

1. Plain `string`.

2. [**`Activity`**](https://www.npmjs.com/package/botframework-schema?activeTab=explore): JSON object defined in `botframework-schema`. These JSON structures are what the framework accepts in the end.

If the service detects the message is already formatted as an `Activity`, it will post it directly to `botframework`</br>
Note: meant for debugging and repeatability

Example of an `Activity` object.

```json
{
  "type": "message",
  "inputHint": "acceptingInput",
  "attachmentLayout": "list",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.hero",
      "content": {
        "title": "Just 2 buttons",
        "buttons": [
          {
            "title": "Button no. 1",
            "value": "one",
            "type": "imBack"
          },
          {
            "title": "Button no. 2",
            "value": "two",
            "type": "imBack"
          }
        ]
      }
    }
  ]
}
```

3.  [**`AdaptiveCard`**](https://docs.microsoft.com/en-us/adaptive-cards/): JSON object defined and supported by Microsoft. These JSON structures are what you'll typically use.</br>

    Adaptive Cards have wide support from Microsoft:

    - [docs](https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-reference#adaptive-card)
    - [schema reference](https://adaptivecards.io/explorer/)
    - [online designer](https://adaptivecards.io/designer/)

Internally, if the service detects the message is an `AdaptiveCard` it will wrap it into an `Activity` before posting to `botframework`</br>
Note: In the designer, make sure you set **target version to 1.2**

Example of an `AdpativeCard` (v1.2) object.

```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.2",
  "body": [
    {
      "type": "Container",
      "items": [
        {
          "type": "TextBlock",
          "text": "Megacoorp",
          "size": "Medium",
          "wrap": true
        },
        {
          "type": "TextBlock",
          "text": "The Future, Today",
          "isSubtle": true,
          "spacing": "None",
          "wrap": true
        },
        {
          "type": "TextBlock",
          "text": "{{DATE(2042-01-01T22:00:00+02:00, SHORT)}}",
          "wrap": true
        }
      ]
    },
    {
      "type": "Container",
      "spacing": "None",
      "items": [
        {
          "type": "ColumnSet",
          "columns": [
            {
              "type": "Column",
              "width": "stretch",
              "items": [
                {
                  "type": "TextBlock",
                  "text": "42",
                  "size": "ExtraLarge",
                  "wrap": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## API Call

Remember that the `message` property should be defined in the first level.

```bash
curl -s -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com", "message": { ... }}'\
 localhost:3978/api/v1/notify | jq
{
  "conversationKey": "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
}
```

```bash
curl -s -H "content-type: application/json"\
 -d '{"topic": "banana", "message": { ... }}'\
 localhost:3978/api/v1/broadcast | jq
{
  "conversationKeys": [
      "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
  ]
}
```

---

> - [To main README](../README.md)
> - [Back to API docs](./api.md)
