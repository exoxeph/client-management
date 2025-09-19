# Use a Python base image, specify a version (e.g., 3.11-slim)
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies needed for Python libraries like psycopg2 and git
# `git` is needed for gitingest
# `build-essential` and `libpq-dev` are for psycopg2 (PostgreSQL client)
# `curl` is for downloading Ollama
# `tree-sitter-cli` might be useful for debugging tree-sitter issues, but CocoIndex manages grammars
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libpq-dev \
    curl \
    # Other potential build tools if CocoIndex needs them (less common for pre-built binaries)
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install Python dependencies first (leverages Docker cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Create a directory where gitingest will clone repositories
# This directory will need to be mounted as a Render Persistent Disk
# for the worker to store cloned repos.
RUN mkdir -p /app/cloned_repos

# --- Install Ollama within the Docker container ---
# This makes Ollama available for the ExtractByLlm function directly in the worker
ENV OLLAMA_VERSION=0.1.37 # Specify a version or use 'latest' if preferred
RUN curl -fsSL https://ollama.com/install.sh | sh && \
    ollama serve & sleep 5 && \ # Start Ollama server in background, wait for it
    ollama pull ${OLLAMA_MODEL:-llama3} && \ # Pull the default model from .env or fallback
    killall ollama || true # Stop Ollama after pulling model

# Command to start the CocoIndex worker
# `--setup`: Ensures database schemas are up-to-date.
# `-L`: Enables live updates (CocoIndex continuously runs the flow, detecting new files in sources).
# `rag_pipeline/main.py`: Path to your main CocoIndex flow definition.
CMD ["cocoindex", "update", "--setup", "-L", "main.py"]