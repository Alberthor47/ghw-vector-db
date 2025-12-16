import 'dotenv/config';
import readline from 'readline';
import { connectToMongoDB, searchMovies, displayResults } from './index.js';

// Create readline interface for interactive input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User's answer
 */
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
        resolve(answer);
        });
    });
}

/**
 * Parse filter options from user input
 * @param {string} filtersString - Comma-separated filters
 * @returns {Object} - Parsed filters object
 */
function parseFilters(filtersString) {
    const filters = {};
    
    if (!filtersString || filtersString.trim() === '') {
        return filters;
    }
    
    const parts = filtersString.split(',').map(s => s.trim());
    
    parts.forEach(part => {
        const [key, value] = part.split(':').map(s => s.trim());
        
        switch(key.toLowerCase()) {
        case 'genre':
        case 'genres':
            filters.genres = value.split('|').map(g => g.trim());
            break;
        case 'minyear':
            filters.minYear = parseInt(value);
            break;
        case 'maxyear':
            filters.maxYear = parseInt(value);
            break;
        case 'minrating':
            filters.minRating = parseFloat(value);
            break;
        }
    });
    
    return filters;
}

/**
 * Interactive search loop
 */
async function interactiveSearch() {
    console.log('\n🎬 Welcome to mflix Semantic Movie Search!');
    console.log('=' .repeat(60));
    console.log('\nPowered by MongoDB Atlas Vector Search and Voyage AI\n');
    
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
        console.error('Failed to connect to MongoDB. Exiting...');
        process.exit(1);
    }
    
    console.log('\n📝 Search Tips:');
    console.log('  - Use natural language to describe the movie plot');
    console.log('  - Add filters: genre:Action, minYear:2000, maxYear:2020, minRating:7.5');
    console.log('  - Multiple genres: genre:Action|Drama\n');
    console.log('  - Type "examples" to see sample searches');
    console.log('  - Type "quit" or "exit" to leave\n');
    
    while (true) {
        try {
        // Get search query
        const query = await askQuestion('🔍 Enter your search query: ');
        
        // Check for exit commands
        if (query.toLowerCase() === 'quit' || query.toLowerCase() === 'exit') {
            console.log('\n👋 Thanks for using mflix search! Goodbye!\n');
            break;
        }
        
        // Show examples
        if (query.toLowerCase() === 'examples') {
            showExamples();
            continue;
        }
        
        if (!query.trim()) {
            console.log('⚠️  Please enter a search query.\n');
            continue;
        }
        
        // Get number of results
        const limitInput = await askQuestion('📊 How many results? (default: 5): ');
        const limit = parseInt(limitInput) || 5;
        
        // Get filters
        const filtersInput = await askQuestion('🔧 Filters (optional, e.g., genre:Action, minYear:2000): ');
        const filters = parseFilters(filtersInput);
        
        // Perform search
        const results = await searchMovies(query, limit, filters);
        displayResults(results);
        
        console.log('\n');
        
        } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('Please try again.\n');
        }
    }
    
    rl.close();
    process.exit(0);
}

/**
 * Display example searches
 */
function showExamples() {
    console.log('\n📚 Example Searches:\n');
    console.log('1. "A violent gangster rises to power in the criminal underworld"');
    console.log('   Filters: genre:Crime|Drama, minYear:1930\n');
    
    console.log('2. "Space exploration and encounters with alien life"');
    console.log('   Filters: genre:Sci-Fi, minRating:7.0\n');
    
    console.log('3. "A romantic story about two people falling in love"');
    console.log('   Filters: genre:Romance, minYear:1990, maxYear:2010\n');
    
    console.log('4. "An epic adventure with heroes fighting evil"');
    console.log('   Filters: genre:Action|Adventure, minRating:7.5\n');
    
    console.log('5. "A funny comedy about friendship and misadventures"');
    console.log('   Filters: genre:Comedy, minYear:2000\n');
}

// Run interactive search
interactiveSearch().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
