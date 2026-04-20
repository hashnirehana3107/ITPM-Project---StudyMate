const mongoose = require('mongoose');
const LecturerRequest = require('./models/LecturerRequest');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const reqs = await LecturerRequest.find().populate('user');
    console.log(JSON.stringify(reqs, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('DB connect err:', err);
    process.exit(1);
  });
