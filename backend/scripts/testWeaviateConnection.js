// backend/testWeaviateConnection.js

// Ensure you have dotenv installed: npm install dotenv
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const { Pinecone } = require('@pinecone-database/pinecone');
const { pipeline } = require('@xenova/transformers'); // For local embeddings
const fs = require('fs');
const path = require('path');



// --- NEW: Asynchronous Transformers.js pipeline initialization ---
let textEmbeddingPipeline = null;
(async () => {
    try {
        console.log('Initializing local text embedding pipeline with Transformers.js...');
        textEmbeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('✅ Local text embedding pipeline initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize Transformers.js pipeline:', error);
    }
})();
// --- END NEW ---

// --- NEW: Pinecone Client Initialization ---
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT; // e.g., 'gcp-starter' or 'us-west-2'
const PINECONE_PROJECT_ID = process.env.PINECONE_PROJECT_ID; // Your Pinecone project ID (often needed for older clients or specific regions)

let pineconeClient = null;

(async () => {
    if (!PINECONE_API_KEY || !PINECONE_ENVIRONMENT) {
        console.error("PINECONE_API_KEY or PINECONE_ENVIRONMENT environment variables are not set. Pinecone client will not be initialized.");
        return;
    }
    // PINECONE_PROJECT_ID might be optional for newer clients or specific starter environments.
    // If you encounter errors, try adding it.
    if (!PINECONE_PROJECT_ID) {
        console.warn("PINECONE_PROJECT_ID environment variable is not set. This may cause issues in some Pinecone environments.");
    }

    try {
        console.log('Attempting Pinecone client initialization...');
        pineconeClient = new Pinecone({
            apiKey: PINECONE_API_KEY,
            environment: PINECONE_ENVIRONMENT,
            // projectId: PINECONE_PROJECT_ID, // Uncomment if your environment requires it
        });
        console.log('✅ Pinecone client initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize Pinecone client:', error.message);
        pineconeClient = null;
    }
})();
// --- END NEW: Pinecone Client Initialization ---

// --- Main Test Function ---
async function runWeaviateTest() {
    console.log('\n--- Starting Weaviate Connection and Ingestion Test ---');

    if (!WEAVIATE_URL || !WEAVIATE_API_KEY) {
        console.error("WEAVIATE_URL or WEAVIATE_API_KEY environment variables are not set in .env. Exiting.");
        return;
    }

    const embedder = await initializeEmbedder();
    if (!embedder) {
        console.error("Embedding pipeline failed to initialize. Cannot proceed.");
        return;
    }

    let client = null;
    const testCollectionName = `TestCollection_${Date.now()}`; // Unique name for each test run

    try {
        // --- 1. Connect to Weaviate ---
        console.log(`Attempting Weaviate client connection to: ${WEAVIATE_URL}`);
        client = await weaviate.connectToWeaviateCloud(
            WEAVIATE_URL,
            {
                authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
            }
        );
        console.log('✅ Weaviate client connected successfully!');
        const isReady = await client.isReady();
        console.log(`Client is ready? ${isReady}`);

        // --- 2. Create/Delete Collection ---
        console.log(`\nAttempting to delete/create collection: ${testCollectionName}`);
        if (await client.collections.exists(testCollectionName)) {
            await client.collections.delete(testCollectionName);
            console.log(`✅ Existing collection '${testCollectionName}' deleted.`);
        }

        const vectorDimensions = 384; // all-MiniLM-L6-v2 output dimension

        await client.collections.create({
            name: testCollectionName,
            properties: [
                { name: 'content', dataType: 'text' },
                { name: 'path', dataType: 'text' },
                { name: 'testId', dataType: 'text' }, // Unique ID for test
            ],
            vectorizer: 'none',
            vectorizerConfig: {
                vectorIndexType: 'hnsw',
                vectorDimensions: vectorDimensions,
            },
        });
        console.log(`✅ Collection '${testCollectionName}' created with vectorizer: 'none' and dimensions: ${vectorDimensions}.`);

        // --- 3. Prepare Dummy Data and Embeddings ---
        console.log('\nPreparing dummy data and embeddings...');
        const testData = [
            { content: 'This is a test document about software development.', path: '/src/test1.js' },
            { content: 'Another document focusing on server-side architecture.', path: '/backend/server.js' },
            { content: 'Frontend components and user interface design.', path: '/frontend/ui.jsx' },
        ];

        const objectsToInsert = [];
        for (const item of testData) {
            const embedding = await embedder(item.content, { pooling: 'mean', normalize: true });
            const vector = Array.from(embedding.data);
            objectsToInsert.push({
                properties: {
                    content: item.content,
                    path: item.path,
                    testId: `test-doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // Unique ID for each test doc
                },
                vector: vector
            });
        }
        console.log(`✅ Prepared ${objectsToInsert.length} objects with local embeddings.`);

        // --- 4. Batch Insert Data ---
        console.log('\nAttempting to insert data...');
        const collection = client.collections.get(testCollectionName);
        const insertResponse = await collection.data.insertMany(objectsToInsert);

        const successfulInserts = Object.keys(insertResponse.uuids).length;
        const failedInserts = Object.keys(insertResponse.errors || {}).length;

        console.log(`✅ Insertion response received. Success: ${successfulInserts}, Errors: ${failedInserts}`);
        if (insertResponse.hasErrors) {
            console.error('❌ Weaviate Insertion errors:', insertResponse.errors);
            throw new Error('Weaviate insertion errors occurred.');
        }

        // --- 5. Verify Object Count ---
        console.log('\nVerifying object count in Weaviate...');
        const countResponse = await collection.aggregate.overAll({ totalCount: true });
        console.log(`✅ Confirmed object count in collection '${testCollectionName}': ${countResponse.totalCount}`);

        if (countResponse.totalCount === objectsToInsert.length) {
            console.log('🎉🎉🎉 SUCCESS: All objects confirmed in Weaviate! 🎉🎉🎉');
        } else {
            console.error(`❌ FAILURE: Object count mismatch. Expected ${objectsToInsert.length}, found ${countResponse.totalCount}.`);
        }

    } catch (error) {
        console.error('\n--- ❌ TEST FAILED: Fatal Error During Weaviate Test ---');
        console.error('Error Message:', error.message);
        console.error('Error Details:', error);
    } finally {
        // --- 6. Close Client (Important) ---
        if (client) {
            // In v4, there's often no explicit `client.close()` needed if `connectToWeaviateCloud` is used,
            // as it manages its own connection pool. If an explicit close exists, uncomment below.
            // await client.close(); // If exists and is needed
            console.log('Weaviate client test finished.');
        }
        console.log('--- Weaviate Connection and Ingestion Test Completed ---');
    }
}

// Run the test script
runWeaviateTest();