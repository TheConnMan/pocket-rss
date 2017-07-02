FROM node:8-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install --production

COPY . /usr/src/app

RUN npm install && npm run compile && npm prune --production

EXPOSE 3000

CMD npm start
