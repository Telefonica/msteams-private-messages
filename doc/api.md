# API 🎨

## Summary

|                                                     | endpoint                     | method | body                                                      |
| :-------------------------------------------------- | :--------------------------- | :----- | :-------------------------------------------------------- |
| Server Info                                         | `/`                          | GET    | ---                                                       |
|                                                     |                              |        |                                                           |
| Main endpoints                                      |                              |        |                                                           |
| [Private notification to user](#notify)             | **`/api/v1/notify`**         | POST   | <pre>{<br> user\*,<br> message\*,<br> mention<br>}</pre>  |
| [Broadcast notification to subscribers](#broadcast) | **`/api/v1/broadcast`**      | POST   | <pre>{<br> topic\*,<br> message\*,<br> mention<br>}</pre> |
| Bot-SDK entry-point                                 | **`/api/v1/messages`**       | POST   | _used by Bot-SDK_                                         |
|                                                     |                              |        |                                                           |
| Debugging                                           |                              |        |                                                           |
| [List users](#users)                                | **`/api/v1/users`**          | GET    | ---                                                       |
| [List topics & subscribers](#topics)                | **`/api/v1/topics`**         | GET    | ---                                                       |
|                                                     |                              |        |                                                           |
| Manual ops                                          |                              |        |                                                           |
| [Register topic](#create-topic)                     | **`/api/v1/topics`**         | POST   | <pre>{<br> name\*<br>}</pre>                              |
| [Force subscriptions](#subscribe)                   | **`/api/v1/topics/{topic}`** | PUT    | <pre>{<br>user\*<br>}</pre>                               |

<a id="notify" />

## Private notification to user

```
POST /api/v1/notify
```

### Parameters

| Name        | Required | Type                | Description                                |
| :---------- | :------- | :------------------ | :----------------------------------------- |
| **user**    | Required | `string`            | Name of the recipient for the notification |
| **message** | Required | `string` or `ICard` | The notification                           |
| mention     | Optional | `boolean`           | Append a mention to the user (@user)       |

```typescript
interface ICard {
  title: string;
  text: string;
}
```

### Response Codes

- **202 Accepted**: notification has been submitted to Microsoft's endpoint.<br>
  Returns the used `conversationId` for traceability.
- **400 Bad Request**: request body doesn't fulfill the requirements.<br>
  Returns the expected parameter list.
- **404 Not Found**: requested user isn't registered in db.<br>
  Returns the given user for traceability.

### Examples

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com", "message": "hi there"}'\
 localhost:3978/api/v1/notify | jq
{
  "conversationKey": "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
}
```

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com", "message": {"text": "this is the text", "title": "this is the title"}}'\
 localhost:3978/api/v1/notify | jq
{
  "conversationKey": "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
}
```

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com", "message": "hi there", "mention": true}'\
 localhost:3978/api/v1/notify | jq
{
  "conversationKey": "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
}
```

```bash
# 400
curl -s -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com"}'\
 localhost:3978/api/v1/notify | jq
{
  "code": "BadRequest",
  "required": [
    "user",
    "message"
  ]
}
```

```bash
# 404
curl -s -H "content-type: application/json"\
 -d '{"user": "bill@unknown.com", "message": "who are you"}'\
 localhost:3978/api/v1/notify | jq
{
  "code": "NotFound",
  "input": {
    "user": "bill@unknown.com"
  }
}
```

<a id="broadcast" />

## Broadcast notification to subscribers

```
POST /api/v1/broadcast
```

### Parameters

| Name        | Required | Type                | Description                                                                          |
| :---------- | :------- | :------------------ | :----------------------------------------------------------------------------------- |
| **topic**   | Required | `string`            | Name of the topic: every user subscribed to this topic will receive the notification |
| **message** | Required | `string` or `ICard` | The notification                                                                     |
| mention     | Optional | `boolean`           | Append a mention to the user (@user)                                                 |

```typescript
interface ICard {
  title: string;
  text: string;
}
```

### Response Codes

- **202 Accepted**: multiple notifications have been submitted to Microsoft's endpoint.<br>
  Returns every used `conversationId` for traceability.<br>
  Note: empty list would mean that there are currently no subscribers to the given topic.
- **400 Bad Request**: request body doesn't fulfill the requirements.<br>
  Returns the expected parameter list
- **404 Not Found**: requested topic isn't registered in db.<br>
  Returns the given topic for traceability.

### Examples

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"topic": "banana", "message": "broadcasting to banana subscribers"}'\
 localhost:3978/api/v1/broadcast
{
  "conversationKeys": [
    "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
  ]
}
```

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"topic": "banana", "message": {"text": "this is the text", "title": "this is the title"}}'\
 localhost:3978/api/v1/broadcast | jq
{
  "conversationKeys": [
    "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
  ]
}
```

```bash
# 202
curl -H "content-type: application/json"\
 -d '{"topic": "banana", "message": "hi there", "mention": true}'\
 localhost:3978/api/v1/broadcast | jq
{
  "conversationKeys": [
    "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
  ]
}
```

```bash
# 202
curl -H "content-type: application/json"\
 -d '{"topic": "tangerine", "message": "anyone there?"}'\
 localhost:3978/api/v1/broadcast | jq
{
  "conversationKeys": []
}
```

```bash
# 400
curl -s -H "content-type: application/json"\
 -d '{"topic": "banana"}'\
 localhost:3978/api/v1/broadcast | jq
{
  "code": "BadRequest",
  "required": [
    "topic",
    "message"
  ]
}
```

```bash
# 404
curl -H "content-type: application/json"\
 -d '{"topic": "unknown", "message": "what is this"}'\
 localhost:3978/api/v1/broadcast | jq
{
  "code": "NotFound",
  "input": {
    "topic": "unknown"
  }
}
```

<a id="users" />

## List users

```
GET /api/v1/users
```

### Query params

None

### Response Codes

- **200 Ok**: nice

### Examples

```bash
# 200
curl -s localhost:3978/api/v1/users | jq
[
  "jane.doe@megacoorp.com",
  "jhon.smith@contractor.com"
]
```

<a id="topics" />

## List topics & subscribers

```
GET /api/v1/topics
```

### Query params

None

### Response Codes

- **200 Ok**: nice

### Examples

```bash
# 200
curl -s localhost:3978/api/v1/topics | jq
{
  "banana": [
    "jane.doe@megacoorp.com"
  ],
  "apple": [
    "jhon.smith@contractor.com"
  ],
  "orange": [
    "jane.doe@megacoorp.com",
    "jhon.smith@contractor.com"
  ]
}
```

<a id="create-topic" />

## Register topic

```
POST /api/v1/topics
```

### Parameters

| Name     | Required | Type     | Description       |
| :------- | :------- | :------- | :---------------- |
| **name** | Required | `string` | Name of the topic |

### Response Codes

- **201 Created**: new topic registered.<br>
  Returns the updated list of topics (equivalent to GET request)
- **200 Ok**: topic already exists.<br>
  Returns the updated list of topics (equivalent to GET request)
- **400 Bad Request**: request body doesn't fulfill the requirements.<br>
  Returns the expected parameter list

### Examples

```bash
# 201
curl -s -H "content-type: application/json"\
 -d '{"name": "tangerine"}'\
 localhost:3978/api/v1/topics | jq
[
  "banana",
  "apple",
  "orange",
  "tangerine"
]
```

```bash
# 200
curl -s -H "content-type: application/json"\
 -d '{"name": "tangerine"}'\
 localhost:3978/api/v1/topics | jq
[
  "banana",
  "apple",
  "orange",
  "tangerine"
]
```

```bash
# 400
curl -s -H "content-type: application/json"\
 -d '{}'\
 localhost:3978/api/v1/topics | jq
{
  "code": "BadRequest",
  "required": [
    "name"
  ]
}
```

<a id="subscribe" />

## Force subscription

```
PUT /api/v1/topics/{topic}
```

### Parameters

| Name     | Required | Type     | Description                              |
| :------- | :------- | :------- | :--------------------------------------- |
| **user** | Required | `string` | Name of the forced subscriber to `topic` |

### Response Codes

TODO

### Examples

```bash
# 200
curl -X PUT -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com"}'\
 localhost:3978/api/v1/topics/tangerine
```

---

> - [Back to main README](../README.md)