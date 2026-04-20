const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StudyMaterial = require('./models/StudyMaterial');

dotenv.config();

const fixPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const materials = await StudyMaterial.find({});
        console.log(`Checking ${materials.length} materials...`);
        
        let count = 0;
        for (let mat of materials) {
            if (mat.fileUrl && mat.fileUrl.includes('\\')) {
                mat.fileUrl = mat.fileUrl.replace(/\\/g, '/');
                await mat.save();
                count++;
            }
        }
        
        console.log(`--- Clean up Complete! ---`);
        console.log(`${count} paths normalized to forward slashes.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixPaths();
