# Use the official Node.js image as the base image
FROM node:18
RUN mkdir -p /app
WORKDIR /app
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy the rest of the app's source code from the host file system into the container
COPY . /app

# Expose port 80
EXPOSE 80 80

# Set the default command to run when a container starts
CMD ["npm", "start"]