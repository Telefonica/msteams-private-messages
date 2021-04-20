# API 🎨

<a id="summary" />

## Summary

|             Group |                                                | method | endpoint                                  |
| ----------------: | :--------------------------------------------- | :----- | :---------------------------------------- |
|                   | Server Info                                    | GET    | `/`                                       |
|  _Main endpoints_ |                                                |        |                                           |
|                 ├ | [Private message to user](#notify)             | POST   | **`/api/v1/notify`**                      |
|                 ├ | [Broadcast message to subscribers](#broadcast) | POST   | **`/api/v1/broadcast`**                   |
|                 └ | [Botframework-SDK entry-point](#botframework)  | POST   | **`/api/v1/messages`**                    |
| _Admin endpoints_ |                                                |        |                                           |
|                 ├ | Server Routes                                  | GET    | **`/api/v1/admin`**                       |
|                 ├ | [User index](#user-index)                      | GET    | **`/api/v1/admin/users`**                 |
|                 ├ | [User detail](#user-detail)                    | GET    | **`/api/v1/admin/users/{user}`**          |
|                 ├ | [Topic index](#topic-index)                    | GET    | **`/api/v1/admin/topics`**                |
|                 ├ | [Topic creation](#create-topic)                | POST   | **`/api/v1/admin/topics`**                |
|                 ├ | [Topic detail](#topic-detail)                  | GET    | **`/api/v1/admin/topics/{topic}`**        |
|                 ├ | [Topic subscription](#subscribe)               | PUT    | **`/api/v1/admin/topics/{topic}`**        |
|                 ├ | [Topic removal](#delete-topic)                 | DELETE | **`/api/v1/admin/topics/{topic}`**        |
|                 └ | [Topic subscription cancelation](#unsubscribe) | DELETE | **`/api/v1/admin/topics/{topic}/{user}`** |

<a id="notify" />

## Private notification to user

```
POST /api/v1/notify
```

### Parameters

| Name        | Required | Type                                      | Description                                                     |
| :---------- | :------- | :---------------------------------------- | :-------------------------------------------------------------- |
| **user**    | Required | `string`                                  | Name of the recipient for the notification                      |
| **message** | Required | `string` or `Activity` or `RichCard` (\*) | The notification                                                |
| mention     | Optional | `boolean`                                 | Append a mention to the user (@user) (only for string messages) |

> \* `message` allows 3 formats, [read more](./message-format.md)

### Response Codes

- **202 Accepted**: notification has been submitted to Microsoft's endpoint.<br>
  Returns the used `conversationKey` for traceability.
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
  "message": "required: 'name', 'message'"
}
```

```bash
# 404
curl -s -H "content-type: application/json"\
 -d '{"user": "bill@unknown.com", "message": "who are you"}'\
 localhost:3978/api/v1/notify | jq
{
  "code": "NotFound",
  "message": "user not found: 'bill@unknown.com'"
}
```

> [up](#summary)

<a id="broadcast" />

## Broadcast notification to subscribers

```
POST /api/v1/broadcast
```

### Parameters

| Name                   | Required   | Type                                      | Description                                                                               |
| :--------------------- | :--------- | :---------------------------------------- | :---------------------------------------------------------------------------------------- |
| **topic**              | Optional\* | `string`                                  | Name of the topic: every user subscribed to this topic will receive the notification      |
| **topics**             | Optional\* | `string[]`                                | List of topics names: every user subscribed to these topics will receive the notification |
| **message**            | Required   | `string` or `Activity` or `RichCard` (\*) | The notification                                                                          |
| mention                | Optional   | `boolean`                                 | Append a mention to the user (@user) (only for string messages)                           |
| createTopicIfNotExists | Optional   | `boolean`                                 | Ensure topic is created if wasn't registered on db                                        |

>
> \* `message` allows 3 formats, [read more](./message-format.md)

### Response Codes

- **202 Accepted**: 1+ notifications have been submitted to Microsoft's endpoint.<br>
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
 -d '{"topic": "banana", "message": "broadcasting to banana subscribers", "mention": true}'\
 localhost:3978/api/v1/broadcast | jq
{
  "conversationKeys": [
    "6afb0bc0-6ba7-11eb-98a1-211142846850|livechat"
  ]
}
```

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"topic": "tangerine", "message": "anyone there?"}'\
 localhost:3978/api/v1/broadcast | jq
{
  "conversationKeys": []
}
```

```bash
# 202
curl -s -H "content-type: application/json"\
 -d '{"topic": "tangerine", "message": "anyone there?", "createTopicIfNotExists": true}'\
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
  "message": "required: 'topic', 'message'"
}
```

> [up](#summary)

<a id="botframework" />

## Botframework-SDK entry-point

```
POST /api/v1/messages
```

> This endpoint will be used by Azure (or the BotEmulator if you're working locally).<br>
> Does only accept POST method and already includes Microsoft's authentication.

> [up](#summary)

---

<a id="user-index" />

## User index

```
GET /api/v1/admin/users
```

### Query params

None

### Response Codes

- **200 Ok**: list of user keys

### Examples

```bash
# 200
curl -s localhost:3978/api/v1/admin/users | jq
[
  "jane.doe@megacoorp.com",
  "jhon.smith@contractor.com"
]
```

> [up](#summary)

<a id="user-detail" />

## User detail

```
GET /api/v1/admin/users/{user}
```

### Query params

None

### Response Codes

- **200 Ok**: user instance
- **404 Not Found**: requested user isn't registered in db.<br>
  Returns the given key for traceability.

### Examples

```bash
# 200
curl -s localhost:3978/api/v1/admin/users/jane.doe%40megacoorp.com | jq
{
  "user": "jane.doe@megacoorp.com",
  "subscriptions": [
    "orange",
    "banana"
  ]
}
```

```bash
# 404
curl -s localhost:3978/api/v1/admin/users/fake.person%40nowhere.com | jq
{
  "code": "NotFound",
  "message": "user not found: 'fake.person@nowhere.com'"
}
```

<a id="topic-index" />

## Topic index

```
GET /api/v1/admin/topics
```

### Query params

None

### Response Codes

- **200 Ok**: list of topic names

### Examples

```bash
# 200
curl -s localhost:3978/api/v1/admin/topics | jq
[
  "banana",
  "apple",
  "orange"
]
```

> [up](#summary)

<a id="create-topic" />

## Topic creation

```
POST /api/v1/admin/topics
```

### Parameters

| Name     | Required | Type     | Description       |
| :------- | :------- | :------- | :---------------- |
| **name** | Required | `string` | Name of the topic |

### Response Codes

- **200 Ok**: registered topic (could already exist).<br>
  Returns the topic (equivalent to a GET request)
- **400 Bad Request**: request body doesn't fulfill the requirements.<br>
  Returns the expected parameter list

### Examples

```bash
# 200
curl -s -H "content-type: application/json"\
 -d '{"name": "tangerine"}'\
 localhost:3978/api/v1/topics | jq
{
  "name": "tangerine",
  "subscribers": []
}
```

```bash
# 400
curl -s -H "content-type: application/json"\
 -d '{}'\
 localhost:3978/api/v1/topics | jq
{
  "code": "BadRequest",
  "message": "required: 'name'"
}
```

> [up](#summary)

<a id="topic-detail" />

## Topic Detail

```
GET /api/v1/admin/topic/:topic
```

### Query params

None

### Response Codes

- **200 Ok**: topic instance.
- **404 Not Found**: requested topic isn't registered in db.<br>
  Returns the given name for traceability.

### Examples

```bash
# 200
curl -s -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/orange | jq
{
  "name": "orange",
  "subscribers": [
    "jane.doe@megacoorp.com",
    "jhon.smith@contractor.com"
  ]
}
```

```bash
# 404
curl -s -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/xxx | jq
{
  "code": "NotFound",
  "message": "xxx"
}
```

> [up](#summary)

<a id="subscribe" />

## Topic subscription

```
PUT /api/v1/admin/topics/{topic}
```

### Parameters

| Name     | Required | Type     | Description                              |
| :------- | :------- | :------- | :--------------------------------------- |
| **user** | Required | `string` | Name of the forced subscriber to `topic` |

### Response Codes

- **200 Ok**: nice<br>
  Returns the `topic` (equivalent to a GET request)
- **400 BadRequest**: request body doesn't fulfill the requirements.<br>
  Returns the expected parameter list
- - **404 Not Found**: requested user isn't registered in db.<br>
    Returns the given user for traceability.

### Examples

```bash
# 200
curl -s -X PUT -H "content-type: application/json"\
 -d '{"user": "jane.doe@megacoorp.com"}'\
 localhost:3978/api/v1/admin/topics/tangerine | jq
{
  "name": "tangerine",
  "subscribers": ["jane.doe@megacoorp.com"]
}
```

```bash
# 400
curl -s -X PUT -H "content-type: application/json"\
 -d '{}'\
 localhost:3978/api/v1/admin/topics/tangerine | jq
{
  "code": "BadRequest",
  "message": "required: 'user'"
}
```

```bash
# 404
curl -s -X PUT -H "content-type: application/json"\
 -d '{"user": "fake.person@nowhere.com"}'\
 localhost:3978/api/v1/admin/topics/tangerine | jq
{
  "code": "NotFound",
  "message": "user not found: 'fake.person@nowhere.com'"
}
```

> [up](#summary)

<a id="delete-topic" />

## Topic removal

```
DELETE /api/v1/admin/topics/{topic}
```

### Response Codes

- **200 Ok**: nice;<br>
  Returns the `topic` list (equivalent to a GET index request).
- **404 Not Found**: requested topic doesn't exist in db.<br>
  Returns the given topic for traceability.

### Examples

```bash
# 200
curl -s -X DELETE -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/tangerine | jq
[
  "banana",
  "apple",
  "orange"
]
```

```bash
# 404
curl -s -X DELETE -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/UNKNOWN | jq
{
  "code": "NotFound",
  "message": "topic not found: 'unknown'"
}
```

> [up](#summary)

<a id="unsubscribe" />

## Topic subscription cancelation

```
DELETE /api/v1/admin/topics/{topic}/{user}
````

### Response Codes

- **200 Ok**: nice; independently of actual operation - e.g. the user wasn't subscribed to the given topic in first place.<br>
  Returns the `topic` (equivalent to a GET request).
- **404 Not Found**: requested user or topic aren't registered in db.<br>
  Returns the given resource for traceability.

### Examples

```bash
# 200
curl -s -X DELETE -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/tangerine/jane.doe%40megacoorp.com | jq
{
  "name": "tangerine",
  "subscribers": []
}
````

```bash
# 404
curl -s -X DELETE -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/tangerine/fake.person%40nowhere.com | jq
{
  "code": "NotFound",
  "message": "user not found: 'fake.person@nowhere.com'"
}
```

```bash
# 404
curl -s -X DELETE -H "content-type: application/json"\
 localhost:3978/api/v1/admin/topics/fake/jane.doe%40megacoorp.com | jq
{
  "code": "NotFound",
  "message": "topic not found: 'fake'"
}
```

---

> - [up](#summary)
> - [Back to main README](../README.md)
> - [More about `message` format](./message-format.md)
