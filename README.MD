# Mallet
A realtime, modern, and transparent hackathon juding and logistics software, designed with a focus on simplifying the thr process fo juding for hackers, judges, and organizers alike

# Setup
We reccomend using Docker and docker-compose

### Development
Start by installing dependencies
```
cd graphql
npm install
```
Start by raising just the db and running prisma migrate:
```
docker-compose up --build db -d
npm run migrate
```

Use the following command to watch for live changes:
```
docker-compose up --build --watch
```

### Production
TBD