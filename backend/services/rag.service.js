const { Pinecone } = require('@pinecone-database/pinecone');
const neo4j = require('neo4j-driver');
const { createClient } = require('redis');
const { pipeline } = require('@xenova/transformers');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Singleton class to manage clients and AI models ---
// This ensures we only initialize these expensive resources once.
class RagService {
    constructor() {
        // Database Clients
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT,
        });
        this.neo4jDriver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
        );
        this.redisClient = createClient({ url: process.env.REDIS_URL });

        // AI Models & Clients
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.embeddingPipeline = null;
        this.rerankerPipeline = null;

        // Connect to Redis immediately
        this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
        this.redisClient.connect();
    }

    // Lazy-load AI pipelines to avoid cold-start delays on server boot
    async getEmbeddingPipeline() {
        if (!this.embeddingPipeline) {
            console.log("Initializing embedding model (all-MiniLM-L6-v2)...");
            this.embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log("Embedding model initialized.");
        }
        return this.embeddingPipeline;
    }

    async getRerankerPipeline() {
        if (!this.rerankerPipeline) {
            console.log("Initializing cross-encoder reranker model...");
            this.rerankerPipeline = await pipeline('text-classification', 'Xenova/cross-encoder/ms-marco-MiniLM-L-6-v2');
            console.log("Reranker model initialized.");
        }
        return this.rerankerPipeline;
    }
    
    // The main method to orchestrate the RAG process
    async ask(query, pineconeIndexName) {
        // --- The "Smart Librarian" Retrieval Strategy ---
        console.log(`[RAG Service] Received query: "${query}" for index: ${pineconeIndexName}`);
        
        // 1. Check Cache First
        const cacheKey = `rag:${pineconeIndexName}:${query}`;
        const cachedAnswer = await this.redisClient.get(cacheKey);
        if (cachedAnswer) {
            console.log("[RAG Service] Returning cached answer.");
            return { answer: cachedAnswer, context: "From Cache" };
        }

        const pineconeIndex = this.pinecone.Index(pineconeIndexName);
        const embedder = await this.getEmbeddingPipeline();

        // 2. Embed the User's Query
        const queryEmbedding = await embedder(query, { pooling: 'mean', normalize: true });

        // 3. Initial Fetch (Vector Search from Pinecone)
        const vectorResults = await pineconeIndex.query({
            vector: Array.from(queryEmbedding.data),
            topK: 20, // Fetch more results initially for re-ranking
            includeMetadata: true,
        });
        
        let initialContext = vectorResults.matches.map(match => ({
            text: match.metadata.content, // Assuming content is stored in metadata
            score: match.score,
            metadata: match.metadata
        }));

        console.log(`[RAG Service] Initial fetch got ${initialContext.length} results from Pinecone.`);
        
        // --- Placeholder for Graph Expansion & Parent Context ---
        // In a future step, we would add Neo4j graph expansion here.
        // For now, we will proceed directly to re-ranking.
        
        let expandedContext = initialContext; // For now, just pass the initial context

        // 4. Re-rank the results with a Cross-Encoder
        const reranker = await this.getRerankerPipeline();
        const pairs = expandedContext.map(doc => [query, doc.text]);
        const rerankedScores = await reranker(pairs, { topk: null });
        
        // Add the new, more accurate scores to our context
        expandedContext.forEach((doc, i) => {
            // Find the corresponding score (label: 'LABEL_1' is relevant)
            const scoreObj = rerankedScores[i].find(s => s.label === 'LABEL_1');
            doc.rerank_score = scoreObj ? scoreObj.score : 0;
        });

        // Sort by the new rerank score, highest first
        expandedContext.sort((a, b) => b.rerank_score - a.rerank_score);
        
        const topKContext = expandedContext.slice(0, 5); // Take the top 5 most relevant results
        console.log(`[RAG Service] Re-ranked and selected Top 5 results.`);

        // 5. Build the Final Prompt for Gemini
        const contextString = topKContext.map((doc, i) => `--- Context Snippet ${i+1} ---\nFile: ${doc.metadata.file_path}\n\n${doc.text}`).join('\n\n');
        
        const prompt = `You are an expert software developer assistant. Answer the user's question based *only* on the following context provided from a codebase. If the answer is not in the context, say "I cannot answer this question based on the provided context."

        CONTEXT:
        ${contextString}
        
        QUESTION:
        ${query}
        
        ANSWER:`;
        
        // 6. Call Gemini for Synthesis
        const geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await geminiModel.generateContent(prompt);
        const answer = result.response.text();
        
        // 7. Store in Cache
        // Store for 1 hour (3600 seconds)
        await this.redisClient.set(cacheKey, answer, { 'EX': 3600 });
        
        return { answer, context: topKContext };
    }
}

// Export a single instance of the service
module.exports = new RagService();