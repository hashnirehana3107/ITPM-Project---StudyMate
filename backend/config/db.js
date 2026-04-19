const mongoose = require('mongoose');
let MongoMemoryServer;

// Try to load memory server for fallback
try {
    const memServer = require('mongodb-memory-server');
    MongoMemoryServer = memServer.MongoMemoryServer;
} catch (error) {
    // Memory server not installed
}

const connectDB = async () => {
    try {
        console.log('--- DB Connection Check ---');
        console.log('URI Found:', process.env.MONGO_URI ? 'Yes' : 'No');
        
        console.log('Attempting to connect to configured MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        console.log('\n--- Troubleshooting Steps ---');
        console.log('1. Go to MongoDB Atlas (cloud.mongodb.com)');
        console.log('2. Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)');
        console.log('3. Ensure your .env has the correct username and password.');
        
        // Wait a bit and try to warn but don't crash the whole process so the user can read it
        console.log('\nServer is running but DATABASE IS NOT CONNECTED yet. Please check step above.');
    }
};

module.exports = connectDB;
