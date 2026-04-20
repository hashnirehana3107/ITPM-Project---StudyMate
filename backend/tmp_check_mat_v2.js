const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StudyMaterial = require('./models/StudyMaterial');

dotenv.config();

const checkMaterial2 = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const mats = await StudyMaterial.find({ subject: /Cloud Computing/i }).limit(5);
        console.log('--- Materials Check 2 ---');
        console.log(JSON.stringify(mats, null, 2));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkMaterial2();
