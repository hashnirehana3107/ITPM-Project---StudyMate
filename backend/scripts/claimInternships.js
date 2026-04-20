const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Internship = require('../models/Internship');

const claimInternships = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the first partner user (the one logged in)
        const partner = await User.findOne({ role: 'partner' });

        if (!partner) {
            console.log('No partner found in the database. Please create a partner account first.');
            process.exit(0);
        }

        console.log(`Found partner: ${partner.name} (${partner._id})`);

        // Update all internships where postedBy is missing or null
        const result = await Internship.updateMany(
            { 
                $or: [
                    { postedBy: { $exists: false } }, 
                    { postedBy: null }
                ] 
            }, 
            { $set: { postedBy: partner._id } }
        );

        console.log(`Successfully claimed ${result.modifiedCount} internships for ${partner.name}.`);
        process.exit(0);
    } catch (error) {
        console.error('Error claiming internships:', error);
        process.exit(1);
    }
};

claimInternships();
