#!/bin/sh
# File: backend/rag_pipeline/start-worker.sh

# Start the Ollama server in the background
ollama serve &

# Wait a few seconds to ensure the Ollama server is ready to accept connections
echo "Waiting for Ollama server to start..."
sleep 5
echo "Ollama server started."

# Start the CocoIndex worker in the foreground. This will be the main process.
echo "Starting CocoIndex worker..."
cocoindex update --setup -L main.py