FROM node:18

WORKDIR /app

COPY package*.json ./
COPY prisma ./

RUN npm config set legacy-peer-deps true

RUN npm install -g npm@9.6.6

RUN npm i

COPY . .

CMD ["npm", "run", "start:dev"]
