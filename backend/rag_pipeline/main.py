"""
This is the main CocoIndex flow definition for our RAG pipeline.
It orchestrates:
1. Sourcing code files from a local directory (within the Docker container).
2. Chunking them intelligently based on language.
3. Extracting basic metadata and richer, LLM-driven relationships.
4. Generating vector embeddings using a local model.
5. Exporting vectors and metadata to Pinecone (cloud-hosted).
6. Exporting relationships to Neo4j (cloud-hosted).
"""
import os
import cocoindex
import dataclasses
from custom_functions import get_language_from_filename, extract_chunk_metadata, CodeRelationship # <-- ADD CodeRelationship here

@cocoindex.flow_def(name="MultiLanguageCodeRAG")
def code_rag_flow(flow_builder: cocoindex.FlowBuilder, data_scope: cocoindex.DataScope):
    # Step 1: Source the data.
    # On Render, this will be mounted as a Persistent Disk or a temp volume
    # where `gitingest` has cloned the repository.
    data_scope["files"] = flow_builder.add_source(
        cocoindex.sources.LocalFile(path="./cloned_repos/") # <-- Using generic name for deployment
    )

    # Step 2: Create collectors to gather our processed data before exporting.
    vector_collector = data_scope.add_collector()
    graph_collector = data_scope.add_collector()

    # Step 3: Process each file found by the source.
    with data_scope["files"].row() as file:
        file["language"] = file["filename"].transform(get_language_from_filename)

        # Use CocoIndex's powerful language-aware chunking for code.
        # This uses Tree-sitter to maintain semantic units in code.
        file["chunks"] = file["content"].transform(
            cocoindex.functions.SplitRecursively(),
            language=file["language"],
            chunk_size=1024,
            chunk_overlap=200,
        )

        # Step 4: Process each chunk created from a file.
        with file["chunks"].row() as chunk:
            # Extract basic regex-based metadata (functions, classes)
            chunk["basic_metadata"] = chunk["text"].transform(extract_chunk_metadata)
            
            # --- Vector Data Preparation ---
            # Generate vector embeddings for semantic search (using a local model)
            chunk["vector_embedding"] = chunk["text"].transform(
                cocoindex.functions.SentenceTransformerEmbed(
                    model="sentence-transformers/all-MiniLM-L6-v2"
                )
            )

            # Combine basic metadata with CocoIndex's built-in chunk metadata (offset, line_numbers, etc.)
            # This ensures Pinecone has rich information for retrieved chunks.
            chunk["combined_metadata"] = chunk["basic_metadata"].combine_with(
                file=file["filename"],
                language=file["language"],
                # Add any other chunk-level metadata from CocoIndex's SplitRecursively output
                chunk_start=chunk["offset"],
                chunk_end=chunk["offset"] + chunk["text"].length(),
                # Consider adding line numbers here if available from SplitRecursively output
            )

            # Collect data for Pinecone
            vector_collector.collect(
                id=cocoindex.GeneratedField.UUID,
                file_path=file["filename"],
                content=chunk["text"],
                embedding=chunk["vector_embedding"],
                metadata=chunk["combined_metadata"]
            )

            # --- Graph Data Preparation (using Ollama) ---
            # Use Ollama to extract structured relationships from code chunks.
            # This is key for building our knowledge graph in Neo4j.
            # RENDER NOTE: Ollama needs to be running in the worker container
            # or accessible from it via RENDER_EXTERNAL_URL_OLLAMA_SERVICE
            chunk["relationships"] = chunk["text"].transform(
                cocoindex.functions.ExtractByLlm(
                    llm_spec=cocoindex.LlmSpec(
                        api_type=cocoindex.LlmApiType.OLLAMA, 
                        model=os.getenv("OLLAMA_MODEL", "llama3"), # Default to llama3
                        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/api") # Default local Ollama API
                    ),
                    output_type=list[CodeRelationship], # Use the dataclass for structured output
                    instruction="From the given code snippet, identify and extract clear relationships between code entities. Focus on function calls (FUNCTION_CALLS), class definitions (DEFINES_CLASS), function definitions (DEFINES_FUNCTION), imports/dependencies (IMPORTS), or inheritance (INHERITS_FROM). Return only explicit relationships. If no explicit relationship is found, return an empty list. Example: {'source_entity_name': 'my_function', 'relation_type': 'CALLS', 'target_entity_name': 'another_function'}"
                )
            )
            with chunk["relationships"].row() as rel:
                graph_collector.collect(
                    rel_id=cocoindex.GeneratedField.UUID, # Unique ID for each relationship
                    source_entity_name=rel["source_entity_name"],
                    relation_type=rel["relation_type"],
                    target_entity_name=rel["target_entity_name"],
                    source_chunk_id=chunk["id"] # Link relationship back to source chunk for context
                )

    # Step 5: Export the collected data to our cloud-hosted databases.

    # --- Export to Pinecone (Vector Database) ---
    vector_collector.export(
        "code_vectors",
        cocoindex.targets.Pinecone(
            index_name=os.getenv("PINECONE_INDEX_NAME"),
            connection=cocoindex.add_auth_entry(
                "pinecone_conn",
                cocoindex.targets.PineconeConnection(
                    api_key=os.getenv("PINECONE_API_KEY"),
                    environment=os.getenv("PINECONE_ENVIRONMENT")
                )
            )
        ),
        primary_key_fields=["id"],
        vector_indexes=[
            cocoindex.VectorIndexDef(field_name="embedding", metric=cocoindex.VectorSimilarityMetric.COSINE_SIMILARITY)
        ]
    )

    # --- Export to Neo4j (Graph Database) ---
    neo4j_conn = cocoindex.add_auth_entry(
        "neo4j_conn",
        cocoindex.targets.Neo4jConnection(
            uri=os.getenv("NEO4J_URI"),
            user=os.getenv("NEO4J_USER"),
            password=os.getenv("NEO4J_PASSWORD"),
            db=os.getenv("NEO4J_DATABASE", "neo4j")
        )
    )
    # Ensure nodes are created for source and target entities if they don't exist
    flow_builder.declare(
        cocoindex.targets.Neo4jDeclaration(
            connection=neo4j_conn,
            nodes=[
                cocoindex.targets.NodeDeclaration(label="CodeEntity", primary_key_fields=["name"])
            ]
        )
    )
    graph_collector.export(
        "code_graph_rels",
        cocoindex.targets.Neo4j(
            connection=neo4j_conn,
            mapping=cocoindex.targets.Relationships(
                rel_type_field="relation_type", # Use the extracted relation_type
                source=cocoindex.targets.NodeFromFields(
                    label="CodeEntity",
                    fields=[cocoindex.targets.TargetFieldMapping("source_entity_name", "name")],
                ),
                target=cocoindex.targets.NodeFromFields(
                    label="CodeEntity",
                    fields=[cocoindex.targets.TargetFieldMapping("target_entity_name", "name")],
                ),
                properties=[ # Link the relationship back to the source chunk ID
                    cocoindex.targets.TargetFieldMapping("source_chunk_id", "source_chunk_id")
                ]
            ),
        ),
        primary_key_fields=["rel_id"]
    )