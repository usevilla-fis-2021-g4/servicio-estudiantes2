FROM node:16-alpine

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY index.js .
COPY profesores.js .
COPY server.js .
COPY db.js .
COPY passport.js .
COPY apikeys.js .
COPY s3.js .

EXPOSE 3000

CMD npm start