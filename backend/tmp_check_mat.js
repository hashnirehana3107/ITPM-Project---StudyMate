const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StudyMaterial = require('./models/StudyMaterial');

dotenv.config();

const checkMaterial = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const mat = await StudyMaterial.findOne({ title: /aaaaaaaaa/i });
        console.log('--- Material Check ---');
        console.log(JSON.stringify(mat, null, 2));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkMaterial();
