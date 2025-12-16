---
marp: true
theme: default
paginate: true
footer: "MongoDB Vector Database | Major League Hacking"
size: 16:9
title: "GHW AI/ML"
---

# MongoDB Vector Database

**Facilitator:** Alberto Camarena  
**Presented at:** Global Hack Week 🌐 AI/ML
**Date:** 15/12/25 📅

---

## Learning Objectives

By the end of this workshop, you will:

- Understand what vector databases are and why they matter
- Learn how vector search differs from traditional search
- Grasp the concept of vector embeddings
- Get knowledge on how MongoDB offers vector capabilities
- Build practical applications: Semantic Search & RAG

---

## What is a Vector Database?

**Traditional Database:**
- Stores data as rows, columns, documents
- Searches by exact matches or keywords

**Vector Database:**
- Stores data as high-dimensional vectors (arrays of numbers)
- Searches by **semantic similarity** (meaning)
- Enables AI-powered search and recommendations

> 💡 **Key Idea:** Similar concepts have similar vector representations in space!

---

## Why Vector Search?

**Traditional Keyword Search Limitations:**
- Misses synonyms: "car" ≠ "automobile"
- No context understanding: "apple" (fruit vs. company)
- Exact match required

**Vector Search Benefits:**
- **Semantic understanding:** Finds meaning, not just keywords
- **Multilingual support:** Search across languages
- **Multimodal:** Text, images, audio unified
- **Context-aware:** Understands intent and relationships

---

## Vector Embeddings

**What are Embeddings?**
- Numerical representations of data (text, images, audio)
- Convert complex data into vectors (arrays of numbers)
- Capture semantic meaning in high-dimensional space

**Example:**
```
"cat" → [0.2, 0.8, -0.3, 0.5, ...]  (768 dimensions)
"kitten" → [0.19, 0.79, -0.29, 0.51, ...]
"dog" → [0.18, 0.75, -0.25, 0.48, ...]
```

🔑 **Similar meanings = Similar vectors!**

---

## How Embeddings Work

1. **Input Data** (text, image, etc.)
2. **Embedding Model** processes data
3. **Vector Output** (numerical representation)
4. **Store in Vector DB**
5. **Similarity Search** finds related items

---

## Reranking Models (or rerankers)

**What is Reranking?**
- A second-stage refinement of search results
- Takes initial results and reorders them for better relevance
- Improves accuracy without changing the initial search

**Why Use Rerankers?**
- 🎯 **Better Precision:** Fine-tune results for user intent
- ⚡ **Efficient:** Fast post-processing step
- 🎨 **Flexible:** Apply business logic and context
- 💰 **Cost-effective:** Cheaper than re-embedding everything

**Flow:** Vector Search → Top K Results → Reranker → Final Ranked Results

---

## Atlas Vector Search

**MongoDB Atlas Vector Search:**
- Native vector search within MongoDB
- No separate infrastructure needed
- Combine vector search with traditional queries

**Key Features:**
- 🔄 **Hybrid Search:** Combine semantic + keyword search
- 📊 **Filtering:** Pre/post-filter by metadata
- 🚀 **Scalable:** Built on MongoDB's proven infrastructure
- 🔐 **Secure:** Enterprise-grade security
- 🌍 **Global:** Multi-region support

---

## Setting Up Atlas Vector Search

**Steps:**

1. **Create a Collection** in MongoDB Atlas
2. **Define a Vector Search Index:**
   - Specify vector field
   - Choose similarity metric (cosine, euclidean, dotProduct)
   - Set dimensions
3. **Insert Documents** with embeddings
4. **Query** using `$vectorSearch` aggregation stage
---

```javascript
{
  $vectorSearch: {
    index: "vector_index",
    path: "embedding",
    queryVector: [0.1, 0.2, ...],
    numCandidates: 100,
    limit: 10
  }
}
```

---
![](/slides/img/mdbvoyage.png)

---

## Voyage AI

**What is Voyage AI?**
- State-of-the-art embedding models
- Specialized for retrieval and search tasks
- High-quality embeddings for various domains

**Why Voyage AI?**
- 🎯 **Accurate:** Domain-specific models
- 🚀 **Fast:** Optimized inference
- 📏 **Flexible:** Multiple model sizes
- 💼 **Enterprise-ready:** Reliable API

---

## Use Case: Building a Semantic Search Engine

**Goal:** Search documents by meaning, not just keywords

**Architecture:**

1. **Document Ingestion**
   - Load documents (PDFs, text files, web pages)
   - Split into chunks
   
2. **Generate Embeddings**
   - Use Voyage AI to create vectors
   
3. **Store in MongoDB**
   - Save documents + embeddings
   
4. **Search**
   - Convert query to embedding
   - Find similar vectors in Atlas
   - Return relevant documents

---

## Semantic Search: Demo

**Example Query:** *"How to improve application performance?"*

**Traditional Search:** Looks for exact words
**Semantic Search:** Understands concepts like:
- "Optimize code"
- "Speed up processing"
- "Reduce latency"
- "Enhance efficiency"

**Benefits:**
- More relevant results
- Natural language queries
- Cross-language support
- Better user experience

---

## Use Case: Building a Retrieval-Augmented Generation (RAG) Application

**What is RAG?**
- Combines retrieval (search) + generation (LLM)
- LLMs get context from your data
- More accurate, up-to-date responses

**RAG Pipeline:**

1. **User asks a question**
2. **Convert query to embedding**
3. **Search vector DB for relevant context**
4. **Send context + query to LLM**
5. **LLM generates informed answer**

---

## RAG: Why It Matters

**Without RAG:**
- ❌ LLM limited to training data
- ❌ No access to private/recent information
- ❌ Prone to hallucinations

**With RAG:**
- ✅ Grounded in your actual data
- ✅ Current information
- ✅ Cites sources
- ✅ Domain-specific knowledge

**Perfect for:** Customer support, documentation search, knowledge bases, Q&A systems

---

## RAG Architecture with MongoDB

```
User Query
    ↓
Embedding Model (Voyage AI)
    ↓
Vector Search (MongoDB Atlas)
    ↓
Retrieve Relevant Documents
    ↓
Combine Query + Context
    ↓
LLM (GPT-4, Claude, etc.)
    ↓
Generated Answer
```

**Key Components:**
- MongoDB Atlas Vector Search for retrieval
- Voyage AI for embeddings
- Your favorite LLM for generation

---

## Thank You — Q\&A

*Questions? Feel free to ask!*
*Ready to build your own ai application?*
Repository: [GitHub - Vector DB](https://github.com/Alberthor47/ghw-vector-db)

---

## Next Steps

**Continue Learning:**

- 📚 [MongoDB Atlas Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- 🎓 [Voyage AI Documentation](https://docs.voyageai.com/)
- 💻 Clone the workshop repo and experiment
- 🚀 Build your own semantic search or RAG app

**Stay Connected:**
- Twitter/X: Share your builds with #MongoDBVectorSearch
- MongoDB Community Forums
- MLH Discord

**Thank you for participating! 🎉**
