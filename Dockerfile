FROM node:12-slim

RUN mkdir /app 
WORKDIR /app

CMD ["./scripts/start.sh"]
