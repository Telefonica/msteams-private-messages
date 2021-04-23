#
# @see https://github.com/nodejs/docker-node
#
FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE ${PORT:-3978}
CMD [ "npm", "start" ]
