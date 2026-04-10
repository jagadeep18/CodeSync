FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript configuration and source code
COPY server/tsconfig.json ./
COPY server/src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the server (using the built JavaScript)
CMD ["node", "dist/server.js"]
