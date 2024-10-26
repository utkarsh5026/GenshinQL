FROM node:20.18.0-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci 

COPY . .

RUN npm run build && \
    npm prune --production

EXPOSE 4000

CMD ["node", "dist/index.js"]