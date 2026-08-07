# POUR LA PROD
# Ajouter apres COPY - "RUN npm install -g serve"
# Ajouter - "RUN npm run build"
# Changer expose 5173 avec 3000
# Changer la CMD avec ["serve", "-s", "dist", "-l", "3000"]

FROM    node:22-alpine

WORKDIR /app

COPY    package.json package-lock.json ./

RUN     npm ci

COPY    . .

EXPOSE  5173

CMD     ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]