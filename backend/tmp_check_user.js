const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findKamal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ name: /Kamal/i });
        console.log('--- Kamal Search Results ---');
        console.log(JSON.stringify(users, null, 2));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findKamal();
