# RAG (Retrieval-Augmented Generation) Application with MongoDB Atlas

## 📖 Overview

This project demonstrates how to build a Retrieval-Augmented Generation (RAG) application using MongoDB Atlas Vector Search, Voyage AI embeddings, and Large Language Models (LLMs). RAG combines the power of semantic search with generative AI to provide accurate, contextual answers grounded in your own data.

## 🎯 What You'll Build

An intelligent Q&A system that:
- Retrieves relevant context from your documents
- Generates accurate answers using LLMs
- Cites sources and provides references
- Handles domain-specific questions
- Reduces hallucinations by grounding responses in real data

## 📋 Prerequisites

- Python 3.8+ or Node.js 16+
- MongoDB Atlas account (free tier works!)
- Voyage AI API key (for embeddings)
- OpenAI API key or other LLM provider (GPT-4, Claude, etc.)
- Basic understanding of Python/JavaScript

## 🚀 MongoDB Atlas Setup

### Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project (e.g., "RAG Application")

### Step 2: Create a Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier (sufficient for development)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "RAGCluster")
5. Click **"Create Cluster"** (deployment takes 3-5 minutes)

### Step 3: Configure Network Access

1. Navigate to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Production:** Use specific IP addresses or VPC peering
4. Click **"Confirm"**

### Step 4: Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Select **"Password"** authentication method
4. Create username and strong password (save these!)
5. Set user privileges: **"Read and write to any database"**
6. Click **"Add User"**

### Step 5: Get Connection String

1. Go to **"Database"** section
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your user password
6. Replace `<dbname>` with `rag_db`

Example:
```
mongodb+srv://username:<password>@ragcluster.xxxxx.mongodb.net/rag_db?retryWrites=true&w=majority
```

### Step 6: Create Database and Collections

1. Click **"Browse Collections"**
2. Click **"Add My Own Data"**
3. Create database: `rag_db`
4. Create collections:
   - `knowledge_base` - For storing document chunks with embeddings
   - `conversations` - (Optional) For storing chat history
5. Click **"Create"**

### Step 7: Create Vector Search Index

1. Navigate to **"Atlas Search"** tab in your cluster
2. Click **"Create Search Index"**
3. Choose **"JSON Editor"**
4. Select database: `rag_db`
5. Select collection: `knowledge_base`
6. Index name: `vector_index`
7. Paste the following JSON configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "source"
    },
    {
      "type": "filter",
      "path": "doc_type"
    },
    {
      "type": "filter",
      "path": "timestamp"
    },
    {
      "type": "string",
      "path": "chunk_id"
    }
  ]
}
```

**Configuration Details:**
- `embedding`: Vector field with 1024 dimensions (Voyage AI `voyage-3`)
- `similarity`: Cosine similarity for text embeddings
- `source`, `doc_type`, `timestamp`: Filterable metadata fields
- `chunk_id`: For referencing specific document chunks

8. Click **"Create Search Index"**
9. Wait for index status to show **"Active"** (1-2 minutes)

## 🔑 Get API Keys

### Voyage AI (Embeddings)

1. Visit [Voyage AI](https://www.voyageai.com/)
2. Sign up and verify your account
3. Go to API Keys section
4. Create new API key
5. Copy and save securely

### OpenAI (or Alternative LLM)

**Option 1: OpenAI (GPT-4)**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create new secret key
5. Copy and save securely

**Option 2: Anthropic (Claude)**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up for API access
3. Generate API key
4. Save securely

**Option 3: Open Source (Ollama, LM Studio)**
- Run models locally
- No API key required
- Good for privacy-sensitive applications

## ⚙️ Environment Variables

Create a `.env` file in this directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:<password>@ragcluster.xxxxx.mongodb.net/rag_db
DATABASE_NAME=rag_db
COLLECTION_NAME=knowledge_base
VECTOR_INDEX_NAME=vector_index

# Voyage AI (Embeddings)
VOYAGE_API_KEY=your_voyage_api_key_here

# LLM Provider (choose one)
OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# RAG Configuration
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K_RESULTS=5
TEMPERATURE=0.1
```

## 📊 Document Schema

Documents in the `knowledge_base` collection:

```json
{
  "_id": "ObjectId",
  "chunk_id": "doc123_chunk_0",
  "content": "Text content of this chunk...",
  "embedding": [0.123, -0.456, 0.789, ...],  // 1024-dimensional vector
  "source": "user_manual.pdf",
  "doc_type": "documentation",
  "page_number": 5,
  "timestamp": "2025-12-15T10:30:00Z",
  "metadata": {
    "author": "Jane Smith",
    "version": "2.0",
    "section": "Configuration"
  }
}
```

## 🔄 RAG Pipeline Flow

```
1. User Question
   ↓
2. Generate Query Embedding (Voyage AI)
   ↓
3. Vector Search (MongoDB Atlas)
   ↓
4. Retrieve Top K Relevant Chunks
   ↓
5. Build Context Prompt
   ↓
6. Send to LLM (GPT-4/Claude)
   ↓
7. Generate Answer
   ↓
8. Return Answer + Sources
```

## 🔍 Vector Search Query for RAG

```javascript
db.knowledge_base.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.123, -0.456, ...],  // Question embedding
      numCandidates: 50,
      limit: 5  // Top 5 most relevant chunks
    }
  },
  {
    $project: {
      _id: 0,
      content: 1,
      source: 1,
      page_number: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
])
```

## 💬 Example Prompt Template

```
You are a helpful AI assistant. Answer the question based ONLY on the following context. 
If the answer cannot be found in the context, say "I don't have enough information to answer that."

CONTEXT:
{retrieved_context}

QUESTION:
{user_question}

ANSWER:
```

## 🎓 Advanced RAG Techniques

### 1. Hybrid Search with Filters

Combine vector search with metadata filters:

```javascript
db.knowledge_base.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [...],
      numCandidates: 50,
      limit: 5,
      filter: {
        doc_type: { $eq: "documentation" },
        timestamp: { $gte: "2025-01-01" }
      }
    }
  }
])
```

### 2. Reranking

Implement two-stage retrieval:
1. Get top 20 candidates with vector search
2. Rerank using cross-encoder model (e.g., Voyage Reranker)
3. Return top 5 after reranking

### 3. Query Expansion

Improve retrieval by expanding user queries:
1. Use LLM to generate variations of the question
2. Search with multiple query embeddings
3. Merge and deduplicate results

### 4. Conversation Memory

Store chat history in the `conversations` collection:

```json
{
  "_id": "ObjectId",
  "session_id": "user123_session456",
  "messages": [
    {"role": "user", "content": "What is..."},
    {"role": "assistant", "content": "Based on..."}
  ],
  "timestamp": "2025-12-15T10:30:00Z"
}
```

### 5. Source Citation

Include source references in responses:

```python
answer = """
Based on the documentation, feature X can be configured by...

Sources:
- User Manual (Page 12)
- Configuration Guide (Page 5)
"""
```

## 🔧 Troubleshooting

### Poor Answer Quality

**Problem:** LLM gives irrelevant or incorrect answers

**Solutions:**
- Increase `TOP_K_RESULTS` to provide more context
- Improve document chunking strategy
- Add more specific metadata filters
- Use better prompts with examples
- Lower temperature for more focused responses

### Slow Response Times

**Problem:** RAG pipeline is too slow

**Solutions:**
- Reduce `numCandidates` in vector search
- Use smaller/faster LLM models
- Cache frequent queries
- Optimize chunk size
- Use streaming responses

### Context Window Exceeded

**Problem:** Too much context for LLM

**Solutions:**
- Reduce `TOP_K_RESULTS`
- Implement context compression
- Use LLMs with larger context windows
- Summarize retrieved chunks before sending

### Hallucinations

**Problem:** LLM makes up information

**Solutions:**
- Add explicit instructions to only use provided context
- Lower temperature (0.0 - 0.3)
- Implement answer validation
- Add confidence scores
- Request citations for all claims

## 📚 Document Ingestion Best Practices

### 1. Chunking Strategy

```python
# Good chunking examples:
- Size: 300-800 tokens per chunk
- Overlap: 50-100 tokens between chunks
- Preserve sentence boundaries
- Keep related content together
```

### 2. Metadata Enrichment

Add rich metadata for better filtering:
- Document type
- Creation/update dates
- Author information
- Section/chapter information
- Language
- Importance/priority

### 3. Document Preprocessing

- Remove noise (headers, footers, page numbers)
- Extract tables and images separately
- Handle special formatting (code blocks, lists)
- Normalize text (encoding, whitespace)

## 🧪 Testing Your RAG System

### Test Categories

1. **Factual Accuracy:** Can it answer direct questions correctly?
2. **Context Relevance:** Does it retrieve the right documents?
3. **Source Citation:** Does it cite sources properly?
4. **Handling Uncertainty:** Does it admit when it doesn't know?
5. **Multi-hop Reasoning:** Can it combine information from multiple sources?

### Sample Test Questions

```
✅ Direct: "What is the pricing for Enterprise plan?"
✅ Conceptual: "How does authentication work?"
✅ Comparative: "What's the difference between X and Y?"
✅ Procedural: "How do I set up feature Z?"
❌ Out-of-scope: "What's the weather today?"
```

## 📊 Monitoring and Evaluation

Track these metrics:
- Query latency
- Retrieval accuracy
- Answer relevance scores
- User feedback (thumbs up/down)
- Context utilization

## 🔗 Useful Resources

- [MongoDB RAG Tutorial](https://www.mongodb.com/developer/products/atlas/rag-atlas-vector-search-langchain-openai/)
- [Voyage AI Documentation](https://docs.voyageai.com/)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)

## 💡 Production Deployment Tips

1. **Caching:** Cache embeddings and frequent queries
2. **Rate Limiting:** Implement rate limits for API calls
3. **Error Handling:** Graceful fallbacks for API failures
4. **Monitoring:** Log queries and track performance
5. **Security:** Sanitize user inputs, protect API keys
6. **Scaling:** Use connection pooling, async operations
7. **Cost Management:** Monitor API usage and optimize

## 🎯 Next Steps

1. Ingest your document collection
2. Test retrieval quality with sample queries
3. Fine-tune chunk size and overlap
4. Experiment with different LLM models
5. Implement conversation history
6. Add reranking for better accuracy
7. Deploy to production!

---

Ready to build intelligent AI applications! 🚀🤖
