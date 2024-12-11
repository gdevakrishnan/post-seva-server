FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose the application port (change this if your app uses a different port)
EXPOSE 5000

# Define the command to run the app
CMD ["node", "index.js"]