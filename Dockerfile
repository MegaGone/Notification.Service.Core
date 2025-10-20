FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/templates

WORKDIR /home/node/app

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

COPY --chown=node:node . .

RUN pnpm run build

ENV NODE_ENV=production

CMD [ "node", "dist/main.js" ]
