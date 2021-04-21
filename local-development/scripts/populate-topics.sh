#!/bin/bash
for i in {1..100}
do
   curl -H 'Content-Type: application/json' \
   -d "{\"name\": \"topic-$i\"}" -s \
   localhost:3978/api/v1/admin/topics
done
