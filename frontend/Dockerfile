FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm config set legacy-peer-deps true

RUN npm install

RUN npx update-browserslist-db@latest

COPY . .

CMD ["npm", "run", "serve"]