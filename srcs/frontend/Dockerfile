# Définit /app comme dossier de travail dans le conteneur
# Installe les versions enregistrées dans package-lock.json
# Copie le code React dans l’image
# --host 0.0.0.0 - Permet aux autres conteneurs d’accéder au serveur Vite
# --strictPort - Vite doit obligatoirement utiliser le port demandé

FROM    node:22-alpine

WORKDIR /app

COPY    package.json package-lock.json ./

RUN     npm ci

COPY    . .

EXPOSE  5173

CMD     ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]