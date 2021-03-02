### [0.6.7](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.6...v0.6.7) (2021-03-02)


### Bug Fixes

* honouring HTTPS_PROXY env var (global-agent) ([7fbc25b](https://github.com/Telefonica/msteams-private-messages/commit/7fbc25b87189694166c3cd50a4e6042a281d0341))

### [0.6.6](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.5...v0.6.6) (2021-03-02)


### Bug Fixes

* catching potential bug at mysql.js ([d1f4bd5](https://github.com/Telefonica/msteams-private-messages/commit/d1f4bd5d873dae9be5b25379a5e2a56286d07cbf))


### Internal

* new unit test 'handlers.test.js' ([a820ede](https://github.com/Telefonica/msteams-private-messages/commit/a820ede3ab5a09edbd98c69911c7dddfead11962))
* npm update semantic-release (dependanbot alert) ([fcc3ca0](https://github.com/Telefonica/msteams-private-messages/commit/fcc3ca0deae7bd4b2304537306837aecf6c2c7c5))

## [0.6.5](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.4...v0.6.5) (2021-02-25)


### Internal

* create server package ([f4fbc16](https://github.com/Telefonica/msteams-private-messages/commit/f4fbc164de19fd2670d89bb8927c7b1b3baa7000))
* fix at local-development/docker-compose.yaml ([3972e9b](https://github.com/Telefonica/msteams-private-messages/commit/3972e9b4a09d0e80dd73256b043f39cc8a8b2988))
* review of [@semantic-release](https://github.com/semantic-release) setup ([fc14c86](https://github.com/Telefonica/msteams-private-messages/commit/fc14c86dbc8491d884df162458a1af05390bcf20))

## [0.6.4](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.3...v0.6.4) (2021-02-23)


### Internal

* change env vars at publish/docker-compose.yaml ([d7878f8](https://github.com/Telefonica/msteams-private-messages/commit/d7878f838a16143937f54279894f08929dcd7335))
* npm script for local dev: 'npm run blue-ball' ([48d98dd](https://github.com/Telefonica/msteams-private-messages/commit/48d98dd60eec5199d29db01ac1334cafadae8253))
* new unit test storage/memory.test.js ([dd48c23](https://github.com/Telefonica/msteams-private-messages/commit/dd48c237502375290a053803b90072fc957441c5))

## [0.6.3](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.2...v0.6.3) (2021-02-22)


### Bug Fixes

* publishing artifact (compose.yaml) with explicit version ([39bae7b](https://github.com/Telefonica/msteams-private-messages/commit/39bae7b9b2baf4c96c2d6f2d816c7c195f317dea))

### Internal

* remove 'publish-artifact' from @semantic-release ([4eac96e](https://github.com/Telefonica/msteams-private-messages/commit/4eac96e2415aecbd426ac8975266e756f2aa36c0))
* 4x scripts (build-container, push-container, prepare-artifact, publish-artifact) ([#3](https://github.com/Telefonica/msteams-private-messages/issues/3)) ([64cb644](https://github.com/Telefonica/msteams-private-messages/commit/64cb6449294b18eed8dbf77fb6e2fd3db279e2bd))

## [0.6.2](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.1...v0.6.2) (2021-02-18)


### Bug Fixes

* override conversationRef on 'conversation update' ([8835b09](https://github.com/Telefonica/msteams-private-messages/commit/8835b099c12feb0d9ab344ecbddc16d1961dd0a6))

### Internal

* server.test.js ([4248885](https://github.com/Telefonica/msteams-private-messages/commit/4248885eaf8fa012e005862d82aee53e659a4f62))
* refactor commits triggering 'patch' release ([c53efcc](https://github.com/Telefonica/msteams-private-messages/commit/c53efcc79e9d6db62a668661c8e7749b10c35077))

## [0.6.1](https://github.com/Telefonica/msteams-private-messages/compare/v0.6.0...v0.6.1) (2021-02-15)


### Bug Fixes

* (bot) reset subscriptions returning updated (empty) subscriptions ([16f28bb](https://github.com/Telefonica/msteams-private-messages/commit/16f28bb35e93f29622dec6349a4dbcecbcbae76d))

### Internal

* improved logging at conversation.js
* minor tuning at API handlers (index.js)
* db log down to trace() level

# [0.6.0](https://github.com/Telefonica/msteams-private-messages/compare/v0.5.0...v0.6.0) (2021-02-15)


### Features

* MySQL storage ([#1](https://github.com/Telefonica/msteams-private-messages/issues/1)) ([9e13945](https://github.com/Telefonica/msteams-private-messages/commit/9e13945db7c66bac8696531ce77e9e46fbb9632b))

# [0.5.0](https://github.com/Telefonica/msteams-private-messages/compare/v0.4.0...v0.5.0) (2021-02-09)


### Bug Fixes

* selecting memory storage by default ([5c5b831](https://github.com/Telefonica/msteams-private-messages/commit/5c5b8319a7c191d88f9affc8db5916a264045897))


### Features

* dockerfile ([453f282](https://github.com/Telefonica/msteams-private-messages/commit/453f282140e98cc0d9174207015be100b1c34a62))

# [0.4.0](https://github.com/Telefonica/msteams-private-messages/compare/v0.3.0...v0.4.0) (2021-02-08)


### Features

* considering "user" instead of user name ([e65941f](https://github.com/Telefonica/msteams-private-messages/commit/e65941fe9538fab1966a2b2748e3ec5b25c0e631))

# [0.3.0](https://github.com/Telefonica/msteams-private-messages/compare/v0.2.0...v0.3.0) (2021-02-03)


### Features

* 2x debugging API endpoints (/usernames & /topics) ([4a991b5](https://github.com/Telefonica/msteams-private-messages/commit/4a991b5a371bbaeebbdfe139825ad4e68e745bb4))

# [0.2.0](https://github.com/Telefonica/msteams-private-messages/compare/v0.1.1...v0.2.0) (2021-02-02)


### Features

* including mention to the user (@user) ([5aeab81](https://github.com/Telefonica/msteams-private-messages/commit/5aeab8127350dd20bf8997c5d2cfba668553cd26))

## [0.1.1](https://github.com/Telefonica/msteams-private-messages/compare/v0.1.0...v0.1.1) (2021-02-01)


### Bug Fixes

* connecting to remote BotFramework when !LOCAL ([0999cd8](https://github.com/Telefonica/msteams-private-messages/commit/0999cd80dac569135ca40e79236658c5656212bc))
* updating db.users on activity properly ([7446557](https://github.com/Telefonica/msteams-private-messages/commit/7446557b7c2425942fd18de25a8f41415c57df06))

## [0.1.0](https://github.com/Telefonica/msteams-private-messages/compare/8e966654ceec5eca4b3affac14d3916f1a0820ee...v0.1.0) (2021-01-29)


### Features

* 'message' may be string or object at API level ([30c2ab5](https://github.com/Telefonica/msteams-private-messages/commit/30c2ab560034248bbf63fbb5acfbedc6e5a46b76))
* proactive broadcast (POST) /api/v1/broadcast ([441a525](https://github.com/Telefonica/msteams-private-messages/commit/441a525bef8fdbe8cf49e88b2c65d5dd95a6544f))
* proactive message to user (POST) /api/v1/notify ([9714999](https://github.com/Telefonica/msteams-private-messages/commit/971499987fc9689de44be6ca93e38ecfec50459d))
* subscription system: user can (un)subscribe to topics ([87dbe34](https://github.com/Telefonica/msteams-private-messages/commit/87dbe3447a003f0ab60b11e1fc49c89799a527b2))
* mapping config.yaml to bot cards (welcomeCard, unknownCard, menuCard) ([8225ba3](https://github.com/Telefonica/msteams-private-messages/commit/8225ba35a0b10b3f0842b1d743be49a161e38c8a))
* messaging endpoint routes to MSTeams bot application ([3d768a5](https://github.com/Telefonica/msteams-private-messages/commit/3d768a5344824622b3cc15b55111b5c45e7e5a66))
