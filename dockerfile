# Use an official Node runtime as the base image
FROM node:16

# Set the working directory in the container to /app
WORKDIR /app

# Update the package list and install SQLite3
RUN apt-get update && apt-get install -y sqlite3

# Verify the installation
RUN sqlite3 --version

# Bundle the app source inside the Docker image 
# (i.e., copy everything from the current directory into /app in the container)
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Install SQLite3 Node.js package
RUN npm install sqlite3 --save

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app when the container launches
CMD ["npm", "start"]