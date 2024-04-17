# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:21-alpine as build
# Set the working directory
WORKDIR /app
# Copy the package.json and package-lock.json files to the container
COPY package*.json ./
# Install all the dependencies
RUN npm install
# Copy the rest of the application code to the container
COPY . .
# Generate the build of the application
RUN npm run build --prod



# Stage 2: Serve the app with nginx server

# Use official nginx image as the base image
FROM nginx:1.25.4-alpine
# Copy the build output from the 'builder' stage to replace the default nginx contents.
COPY --from=build /app/dist/llm-pdfchat-app /usr/share/nginx/html
# EXPOSE PORT 80 to the outside world
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]












