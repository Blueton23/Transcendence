FROM    node:22-alpine

WORKDIR /app

RUN     npm install -g serve

COPY    package.json package-lock.json ./

RUN     npm ci

COPY    . .

ARG     VITE_MAPBOX_TOKEN

RUN     npm run build

EXPOSE  3000

CMD     ["serve", "-s", "dist", "-l", "3000"]