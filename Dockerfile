# Use official Node.js image as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
ADD . .

# Install NestJS dependencies
RUN yarn

# Copy the rest of the application code
# COPY . .

# Expose the port the app runs on
# EXPOSE 3000

RUN npx prisma generate

# Command to run the app
CMD ["yarn", "start", "dev"]