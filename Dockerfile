FROM node:20-alpine as deploy-node

RUN apk update && apk add openssl1.1-compat shadow
RUN npm install -g pm2

ENV PGID=1000
ENV PUID=1000
ENV NAME=photos

RUN groupmod -g "${PGID}" node && usermod -u "${PUID}" -g "${PGID}" node

RUN mkdir -p /app
RUN chown -R node:node /app
USER node

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
RUN npm install

COPY --chown=node:node  . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

RUN pm2 link 2ktble5bhdclxfk 8m3qs9tey7yt2zo

USER node
ENV BODY_SIZE_LIMIT=0
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host

CMD ["pm2-runtime", "build/index.js", "-i", "8"]



