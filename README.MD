# Mallet

A realtime, modern, and transparent hackathon juding and logistics software, designed with a focus on simplifying the the process of judging for hackers, judges, and organizers alike

# Setup

We reccomend using Docker and docker-compose

### Development

Set up with the following commands:

```
cd graphql
npm install
cd ../frontend
npm install
cd ..
```

Use the following command to set up and watch for live changes:

```
docker-compose up --build --watch
```

### Production

TBD
Going command is:
```
docker-compose -f docker-compose.prod.yml up --build
```
