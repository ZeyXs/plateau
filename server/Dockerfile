# Use the official Node.js image as the base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Environment variables
ARG DATABASE_URI
ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET

ENV DATABASE_URI=$DATABASE_URI
ENV ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
ENV REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . ./

# Expose the port on which the app will run
EXPOSE 4000

# Start the app
CMD ["node", "index.js"]