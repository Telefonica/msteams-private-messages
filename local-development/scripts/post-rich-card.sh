#!/bin/bash
curl -s -H "content-type: application/json" \
    -d '{"user": "User", "message": {"type": "message","attachmentLayout": "list","attachments": [{"contentType": "application/vnd.microsoft.card.hero","content": {"title": "Available Options","buttons": [{"title": "Button no. 1","value": "one","type": "imBack"},{"title": "Button no. 2","value": "two","type": "imBack"}]}}],"inputHint": "acceptingInput"}}' \
    localhost:3978/api/v1/notify | jq
