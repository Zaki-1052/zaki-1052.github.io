#!/bin/bash

# Simple test server for modular portfolio
# This script starts a local web server for testing

PORT=8000
URL="http://localhost:$PORT/portfolio/index-modular.html"

echo "🚀 Starting local server for modular portfolio..."
echo "📁 Directory: $(pwd)"
echo "🌐 URL: $URL"
echo ""
echo "Press Ctrl+C to stop the server"
echo "-----------------------------------"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    cd ..
    python3 -m http.server $PORT
# Check if Python 2 is available
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    cd ..
    python -m SimpleHTTPServer $PORT
# Check if Node.js http-server is available
elif command -v npx &> /dev/null; then
    echo "Using Node.js http-server..."
    cd ..
    npx http-server -p $PORT
# Check if PHP is available
elif command -v php &> /dev/null; then
    echo "Using PHP..."
    cd ..
    php -S localhost:$PORT
else
    echo "❌ Error: No suitable server found."
    echo "Please install Python, Node.js, or PHP to run a local server."
    exit 1
fi
