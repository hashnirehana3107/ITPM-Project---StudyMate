const mongoose = require('mongoose');
require('dotenv').config();

const fixDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const c = db.collection('studymaterials');
        
        // Reset the deeply nested objects
        await c.updateMany(
            {}, 
            { $set: { "reactions.like": [], "reactions.helpful": [] } }
        );
        
        console.log("Reactions arrays reset complete.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixDb();
