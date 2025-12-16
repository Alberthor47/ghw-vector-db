import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { VoyageAIClient } from 'voyageai';

// Configuration
const config = {
    mongoUri: process.env.MONGODB_URI,
    voyageApiKey: process.env.VOYAGE_API_KEY,
    databaseName: process.env.DATABASE_NAME,
    collectionName: process.env.COLLECTION_NAME,
    vectorIndexName: process.env.VECTOR_INDEX_NAME
};

// Initialize clients
const voyageClient = new VoyageAIClient({ apiKey: config.voyageApiKey });
let mongoClient;
let db;
let collection;

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
    try { 
        mongoClient = new MongoClient(config.mongoUri);
        await mongoClient.connect();
        db = mongoClient.db(config.databaseName);
        collection = db.collection(config.collectionName);
        console.log('✅ Connected to MongoDB Atlas');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    } 
}

/**
 * Generate embedding for a text query using Voyage AI
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbedding(text) {
    try {
        const response = await voyageClient.embed({
        input: text,
        model: 'voyage-large-2',  // voyage-large-2 produces 1536 dimensions
        inputType: 'query'
        });
        
        console.log(`   Generated embedding with ${response.data[0].embedding.length} dimensions`);
        return response.data[0].embedding;
    } catch (error) {
        console.error('❌ Error generating embedding:', error.message);
        throw error;
    }
}

/**
 * Perform vector search on movie plots
 * @param {string} query - The search query
 * @param {number} limit - Number of results to return
 * @param {Object} filters - Optional filters (genres, year, rating)
 * @returns {Promise<Array>} - Search results
 */
async function searchMovies(query, limit = 5, filters = {}) {
    try {
        console.log(`\n🔍 Searching for: "${query}"`);
        
        // Generate embedding for the query
        console.log('⚙️  Generating query embedding...');
        const queryEmbedding = await generateEmbedding(query);
        
        // Build the aggregation pipeline
        const pipeline = [
        {
            $vectorSearch: {
            index: config.vectorIndexName,
            path: 'plot_embedding',
            queryVector: queryEmbedding,
            numCandidates: 150,
            limit: limit
            }
        },
        {
            $project: {
            _id: 0,
            title: 1,
            plot: 1,
            year: 1,
            genres: 1,
            cast: { $slice: ['$cast', 3] }, // First 3 cast members
            directors: 1,
            'imdb.rating': 1,
            runtime: 1,
            poster: 1,
            score: { $meta: 'vectorSearchScore' }
            }
        }
        ];
        
        // Add filters if provided
        if (Object.keys(filters).length > 0) {
        const filterStage = { $match: {} };
        
        if (filters.genres) {
            filterStage.$match.genres = { $in: filters.genres };
        }
        if (filters.minYear) {
            filterStage.$match.year = { $gte: filters.minYear };
        }
        if (filters.maxYear) {
            filterStage.$match.year = filterStage.$match.year || {};
            filterStage.$match.year.$lte = filters.maxYear;
        }
        if (filters.minRating) {
            filterStage.$match['imdb.rating'] = { $gte: filters.minRating };
        }
        
        // Insert filter after vectorSearch
        pipeline.splice(1, 0, filterStage);
        }
        
        // Execute search
        console.log('🎬 Searching movies...\n');
        const results = await collection.aggregate(pipeline).toArray();
        
        return results;
    } catch (error) {
        console.error('❌ Search error:', error.message);
        throw error;
    }
}

/**
 * Display search results in a formatted way
 * @param {Array} results - Search results to display
 */
function displayResults(results) {
    if (results.length === 0) {
        console.log('No results found.');
        return;
    }
    
    console.log(`📊 Found ${results.length} results:\n`);
    console.log('='.repeat(80));
    
    results.forEach((movie, index) => {
        console.log(`\n${index + 1}. ${movie.title} (${movie.year || 'N/A'})`);
        console.log(`   Score: ${(movie.score * 100).toFixed(2)}%`);
        
        if (movie.imdb?.rating) {
        console.log(`   IMDB Rating: ⭐ ${movie.imdb.rating}/10`);
        }
        
        if (movie.genres && movie.genres.length > 0) {
        console.log(`   Genres: ${movie.genres.join(', ')}`);
        }
        
        if (movie.directors && movie.directors.length > 0) {
        console.log(`   Director(s): ${movie.directors.join(', ')}`);
        }
        
        if (movie.cast && movie.cast.length > 0) {
        console.log(`   Cast: ${movie.cast.join(', ')}`);
        }
        
        if (movie.runtime) {
        console.log(`   Runtime: ${movie.runtime} minutes`);
        }
        
        if (movie.plot) {
        const shortPlot = movie.plot.length > 150 
            ? movie.plot.substring(0, 150) + '...' 
            : movie.plot;
        console.log(`   Plot: ${shortPlot}`);
        }
        
        console.log('-'.repeat(80));
    });
}

/**
 * Example searches
 */
async function runExamples() {
    await connectToMongoDB();
    
    try {
        // Example 1: Basic search
        console.log('\n🎯 Example 1: Basic Movie Search');
        let results = await searchMovies('A violent gangster rises to power', 5);
        displayResults(results);
        
        // Example 2: Search with genre filter
        console.log('\n\n🎯 Example 2: Search for Sci-Fi Movies');
        results = await searchMovies('space exploration and alien encounters', 5, {
        genres: ['Sci-Fi']
        });
        displayResults(results);
        
        // Example 3: Search with multiple filters
        console.log('\n\n🎯 Example 3: Highly-rated Dramas from 1990-2010');
        results = await searchMovies('emotional journey and personal growth', 5, {
        genres: ['Drama'],
        minYear: 1990,
        maxYear: 2010,
        minRating: 7.5
        });
        displayResults(results);
        
        // Example 4: Comedy search
        console.log('\n\n🎯 Example 4: Funny Comedies');
        results = await searchMovies('hilarious adventure with friends', 5, {
        genres: ['Comedy']
        });
        displayResults(results);
        
    } catch (error) {
        console.error('Error running examples:', error);
    } finally {
        await mongoClient.close();
        console.log('\n✅ Connection closed');
    }
}

// Export functions for use in other modules
export {
    connectToMongoDB,
    generateEmbedding,
    searchMovies,
    displayResults,
    config
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples();
}
