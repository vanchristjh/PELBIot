#!/bin/bash

echo "🚀 PELBIOT Backend Server Starting..."
echo ""
echo "📝 Environment check:"
node -v
npm -v
echo ""

echo "🔧 Starting backend server..."
echo "📡 Server will listen on port 5000"
echo ""

node server.js
