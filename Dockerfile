FROM node:18.16.0

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY . .

ENV PORT 3000

RUN npm install
ENTRYPOINT ["npm", "start"]
