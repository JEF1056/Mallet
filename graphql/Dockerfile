FROM node:18.20.2-alpine
WORKDIR /usr/src/graphql
COPY package*.json ./
RUN npm install
COPY prisma ./
RUN npx prisma generate
COPY . .
EXPOSE 4000
ENV NODE_ENV=development
CMD ["npm", "start"]