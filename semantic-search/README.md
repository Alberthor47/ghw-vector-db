# Semantic Search Engine with MongoDB Atlas Vector Search

## 📖 Overview

This project demonstrates how to build a semantic search engine using MongoDB Atlas Vector Search and Voyage AI embeddings. Unlike traditional keyword search, semantic search understands the meaning and context of queries to return more relevant results.

## 🎯 What You'll Build

A search system that:
- Understands natural language queries
- Finds semantically similar documents
- Returns results based on meaning, not just keywords
- Supports cross-language search capabilities

## 📋 Prerequisites

- Python 3.8+ or Node.js 16+
- MongoDB Atlas account (free tier works!)
- Voyage AI API key
- Basic understanding of Python/JavaScript

## 🚀 MongoDB Atlas Setup

### Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (M0 cluster is sufficient)
3. Create a new project (e.g., "Vector Search Demo")

### Step 2: Create a Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "VectorSearchCluster")
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IP addresses
4. Click **"Confirm"**

### Step 4: Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and password (save these securely!)
5. Set user privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 5: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., "semantic_search")

Example connection string:
```
mongodb+srv://username:<password>@vectorsearchcluster.xxxxx.mongodb.net/semantic_search?retryWrites=true&w=majority
```

### Step 6: Create a Database and Collection

1. Click **"Browse Collections"** on your cluster
2. Click **"Add My Own Data"**
3. Database name: `semantic_search`
4. Collection name: `documents`
5. Click **"Create"**

### Step 7: Create a Vector Search Index

1. In your cluster, go to the **"Atlas Search"** tab
2. Click **"Create Search Index"**
3. Choose **"JSON Editor"**
4. Select your database: `semantic_search`
5. Select your collection: `documents`
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
      "path": "category"
    },
    {
      "type": "filter",
      "path": "date"
    }
  ]
}
```

**Configuration Explanation:**
- `path`: "embedding" - The field containing vector embeddings
- `numDimensions`: 1024 - Voyage AI's `voyage-3` model dimension
- `similarity`: "cosine" - Similarity metric (cosine, euclidean, or dotProduct)
- Additional filter fields for metadata filtering

8. Click **"Create Search Index"**
9. Wait for the index to build (status: "Active") - takes 1-2 minutes

## 🔑 Get Voyage AI API Key

1. Go to [Voyage AI](https://www.voyageai.com/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy and save it securely

## ⚙️ Environment Variables

Create a `.env` file in this directory with:

```env
MONGODB_URI=mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/semantic_search
VOYAGE_API_KEY=your_voyage_api_key_here
DATABASE_NAME=semantic_search
COLLECTION_NAME=documents
VECTOR_INDEX_NAME=vector_index
```

## 📊 Document Schema

Documents in the collection follow this structure:

```json
{
  "_id": "ObjectId",
  "title": "Document Title",
  "content": "The full text content of the document...",
  "embedding": [0.123, -0.456, 0.789, ...],  // 1024-dimensional vector
  "category": "technology",
  "date": "2025-12-15",
  "metadata": {
    "author": "John Doe",
    "source": "blog"
  }
}
```

## 🔍 How Vector Search Works in This Application

1. **Ingestion Phase:**
   - Load documents from your data source
   - Generate embeddings using Voyage AI
   - Store documents with embeddings in MongoDB

2. **Search Phase:**
   - User enters a natural language query
   - Query is converted to an embedding using Voyage AI
   - MongoDB Atlas finds similar vectors using cosine similarity
   - Results are ranked and returned

## 📝 Sample Vector Search Query

```javascript
db.documents.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.123, -0.456, ...],  // Query embedding
      numCandidates: 100,  // Number of candidates to consider
      limit: 10  // Return top 10 results
    }
  },
  {
    $project: {
      _id: 1,
      title: 1,
      content: 1,
      category: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
])
```

## 🎓 Advanced Features

### Hybrid Search (Semantic + Keyword)

Combine vector search with text filters:

```javascript
db.documents.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.123, -0.456, ...],
      numCandidates: 100,
      limit: 10,
      filter: {
        category: { $eq: "technology" }
      }
    }
  }
])
```

### Pre-filtering

Filter before vector search to narrow results:

```javascript
db.documents.aggregate([
  {
    $match: {
      date: { $gte: "2025-01-01" }
    }
  },
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.123, -0.456, ...],
      numCandidates: 50,
      limit: 10
    }
  }
])
```

## 🔧 Troubleshooting

### Index Status Not Active
- Wait 2-5 minutes after creating the index
- Refresh the Atlas Search page
- Check for any error messages in the index status

### Connection Issues
- Verify your IP is whitelisted in Network Access
- Check your connection string format
- Ensure password doesn't contain special characters (or URL encode them)

### Empty Search Results
- Verify documents have embeddings in the correct field
- Check embedding dimensions match index configuration (1024)
- Ensure index name matches in your code

### Slow Queries
- Increase `numCandidates` for better recall (may reduce speed)
- Decrease `numCandidates` for faster queries (may reduce accuracy)
- Consider adding filters to narrow the search space

## 📚 Next Steps

1. Run the ingestion script to load sample documents
2. Test the search functionality with various queries
3. Experiment with different similarity metrics
4. Add custom metadata fields for filtering
5. Implement reranking for improved results

## 🔗 Useful Resources

- [MongoDB Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [Voyage AI Documentation](https://docs.voyageai.com/)
- [Vector Search Tutorial](https://www.mongodb.com/docs/atlas/atlas-vector-search/tutorials/)

## 💡 Tips for Better Search Results

1. **Chunk your documents appropriately** - Smaller chunks (200-500 words) often work better
2. **Use consistent embeddings** - Always use the same model for indexing and querying
3. **Experiment with similarity metrics** - Cosine usually works well for text
4. **Add metadata filters** - Narrow results by category, date, or other fields
5. **Monitor query performance** - Use MongoDB Atlas monitoring tools

---

Happy searching! 🚀
