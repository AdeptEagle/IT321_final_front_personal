#!/bin/bash

# Install dependencies
npm install --legacy-peer-deps

# Install Angular CLI
npm install @angular/cli@17.3.2 --save-dev

# Create the dist directory if it doesn't exist
mkdir -p dist/angular-signup-verification-boilerplate

# Run the build using the local Angular CLI
./node_modules/.bin/ng build --configuration production --output-path=dist/angular-signup-verification-boilerplate

# List the contents of the dist directory to verify the build
ls -la dist/angular-signup-verification-boilerplate 