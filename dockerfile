# Stage 1: Build the application
FROM node:18 as build

# Set the working directory in the container
WORKDIR /usr/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Transpile TypeScript to JavaScript
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Create the final image
FROM node:18-slim as final

RUN apt-get update -y && apt-get install -y openssl

# Set the working directory in the container
WORKDIR /usr/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/app/package*.json ./
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/prisma ./prisma
COPY --from=build /usr/app/.env ./

RUN npm install --only=production

RUN npx prisma generate

# Expose the port your app will run on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "run", "start"]
