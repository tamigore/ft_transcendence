FROM node:18

EXPOSE  8080

EXPOSE  8081

WORKDIR /app

COPY package*.json ./
COPY prisma ./

# RUN npm config set legacy-peer-deps true

RUN npm install && npm cache clean --force

RUN npm i

COPY . .

CMD ["npm", "run", "start:prisma:push"]
