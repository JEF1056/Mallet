FROM node:18.20.2
WORKDIR /usr/src/frontend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "dev"]