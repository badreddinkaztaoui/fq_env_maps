FROM node:alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json /app/

RUN pnpm install

EXPOSE 3000

CMD [ "pnpm", "dev" ]