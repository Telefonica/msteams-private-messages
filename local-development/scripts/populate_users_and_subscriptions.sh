#!/bin/bash

echo "Adding user1..."
docker-compose exec -T mpm-db mysql -D msteamsbot -e "INSERT INTO \`Users\` (\`id\`, \`user\`, \`conversationKey\`, \`conversationRef\`, \`createdAt\`, \`updatedAt\`) VALUES (10, 'user1', '95f50d5c-e86c-4ede-8d26-00303afbd310|livechat', '{\"bot\": {\"id\": \"93e5eca1-60f3-4401-964b-09891d9172a6\", \"name\": \"Bot\", \"role\": \"bot\"}, \"user\": {\"id\": \"c75b3d70-caeb-4b2c-96ec-dc57f8f15349\", \"name\": \"User\", \"role\": \"user\"}, \"locale\": \"\", \"channelId\": \"emulator\", \"activityId\": \"60e92a94-0bc1-4bd8-bf50-00ab7ebafcaf\", \"serviceUrl\": \"https://378f3c3ecbb7.ngrok.io\", \"conversation\": {\"id\": \"95f50d5c-e86c-4ede-8d26-00303afbd310|livechat\"}}', '2021-03-25 14:25:59', '2021-04-12 13:17:49') ;"
echo "Done."

echo ""

echo "Adding user2..."
docker-compose exec -T mpm-db mysql -D msteamsbot -e "INSERT INTO \`Users\` (\`id\`, \`user\`, \`conversationKey\`, \`conversationRef\`, \`createdAt\`, \`updatedAt\`) VALUES (11, 'user2', '758681cd-8c9d-4159-b831-64455a549a39|livechat', '{\"bot\": {\"id\": \"b9dcb1f0-a2b9-11eb-acc9-63bb7bbface3\", \"name\": \"Bot\", \"role\": \"bot\"}, \"user\": {\"id\": \"e7692c26-aad4-4c68-a670-64731c37fe2b\", \"name\": \"User\", \"role\": \"user\"}, \"locale\": \"\", \"channelId\": \"emulator\", \"activityId\": \"b9f85040-a2b9-11eb-bd10-75264fb10b53\", \"serviceUrl\": \"https://ca723b1fddaf.ngrok.io\", \"conversation\": {\"id\": \"758681cd-8c9d-4159-b831-64455a549a39|livechat\"}}', '2021-04-21 15:53:35', '2021-04-21 15:53:35') ;"
echo "Done."

echo ""

echo "Adding some subscriptions for user1 and user2..."
curl -s -X PUT -H "content-type: application/json" \
    -d '{"user": "user1"}' \
    localhost:3978/api/v1/admin/topics/topic1

curl -s -X PUT -H "content-type: application/json" \
    -d '{"user": "user2"}' \
    localhost:3978/api/v1/admin/topics/topic1

curl -s -X PUT -H "content-type: application/json" \
    -d '{"user": "user1"}' \
    localhost:3978/api/v1/admin/topics/topic2

curl -s -X PUT -H "content-type: application/json" \
    -d '{"user": "user2"}' \
    localhost:3978/api/v1/admin/topics/topic3

echo "Done."
