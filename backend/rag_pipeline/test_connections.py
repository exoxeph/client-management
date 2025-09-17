import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text # <-- ADD text import
from neo4j import AsyncGraphDatabase
import asyncio
from pinecone import Pinecone # <-- Change init, list_indexes to Pinecone

# Load environment variables from .env file
print("Attempting to load .env file...")
load_dotenv()
print(".env file loaded.")

async def test_all_connections():
    """Tests connections to PostgreSQL, Neo4j, and Pinecone."""
    print("\n--- Starting Connection Tests ---")
    
    # 1. Test PostgreSQL Connection
    print("\n[1/3] Testing PostgreSQL connection...")
    try:
        pg_url = os.getenv("COCOINDEX_DATABASE_URL")
        if not pg_url:
            raise ValueError("COCOINDEX_DATABASE_URL not found in .env file.")
        
        engine = create_engine(pg_url)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1")) # <-- Use text() for execution
            print("✅ SUCCESS: Connected to PostgreSQL successfully.")
    except Exception as e:
        print(f"❌ FAILED: Could not connect to PostgreSQL. Error: {e}")
        print("   - Make sure your PostgreSQL Docker container is running.")
        print(f"   - Check that COCOINDEX_DATABASE_URL is set correctly in your .env file.")

    # 2. Test Neo4j Connection
    print("\n[2/3] Testing Neo4j connection...")
    driver = None
    try:
        neo4j_uri = os.getenv("NEO4J_URI")
        neo4j_user = os.getenv("NEO4J_USER")
        neo4j_password = os.getenv("NEO4J_PASSWORD")

        if not all([neo4j_uri, neo4j_user, neo4j_password]):
            raise ValueError("Neo4j connection details not found in .env file.")

        driver = AsyncGraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        async with driver.session() as session:
            await session.run("MATCH (n) RETURN count(n) AS count")
        print("✅ SUCCESS: Connected to Neo4j successfully.")
    except Exception as e:
        print(f"❌ FAILED: Could not connect to Neo4j. Error: {e}")
        print("   - Make sure your Neo4j Docker container is running.")
        print("   - Check that Neo4j credentials in your .env file are correct.")
    finally:
        if driver:
            await driver.close()

    # 3. Test Pinecone Connection
    print("\n[3/3] Testing Pinecone connection...")
    try:
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_env = os.getenv("PINECONE_ENVIRONMENT")

        if not pinecone_api_key or "YOUR_PINECONE_API_KEY" in pinecone_api_key:
             raise ValueError("Pinecone API key not found or is a placeholder in .env file.")
        if not pinecone_env or "YOUR_PINECONE_ENVIRONMENT" in pinecone_env:
             raise ValueError("Pinecone environment not found or is a placeholder in .env file.")

        pc = Pinecone(api_key=pinecone_api_key, environment=pinecone_env) # <-- Create Pinecone instance
        indexes = pc.list_indexes().names() # <-- Use instance to list indexes
        print(f"✅ SUCCESS: Connected to Pinecone successfully. Found indexes: {indexes}")
    except Exception as e:
        print(f"❌ FAILED: Could not connect to Pinecone. Error: {e}")
        print("   - Make sure your Pinecone API Key and Environment are correct in the .env file.")

    print("\n--- Connection Tests Finished ---")

if __name__ == "__main__":
    asyncio.run(test_all_connections())