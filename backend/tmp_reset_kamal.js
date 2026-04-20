const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetKamalPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'kamalperera@gmail.com' });
        if (user) {
            user.password = '123456';
            await user.save();
            console.log('--- Kamal Password Reset Success! ---');
            console.log('Email: kamalperera@gmail.com');
            console.log('New Password: 123456');
        } else {
            console.log('User NOT found!');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetKamalPassword();
