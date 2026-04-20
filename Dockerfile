# Dev-focused Dockerfile that runs the Vite dev server on port 8080
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

EXPOSE 8080

# Vite is configured (in vite.config.ts) to bind to :: on port 8080
CMD ["npm", "run", "dev", "--", "--host"]
