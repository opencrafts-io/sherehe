# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package fa: triles first (for caching layers)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the app port (default Express 3000)
EXPOSE 3001

# Start the app
CMD ["npm", "start"]