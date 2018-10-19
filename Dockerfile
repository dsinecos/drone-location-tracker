FROM node:8-alpine

WORKDIR /usr/app/

COPY package.json ./
RUN yarn install

COPY ./ ./

CMD ["node", "index.js"]