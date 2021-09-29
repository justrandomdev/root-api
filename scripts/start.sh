#!/bin/bash

echo "Setting up project..."
npm install
npm run codegen
npm run start
