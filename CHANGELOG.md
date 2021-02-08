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