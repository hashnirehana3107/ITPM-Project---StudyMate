const mongoose = require('mongoose');
const User = require('./models/User');
const LecturerRequest = require('./models/LecturerRequest');

const uri = "mongodb+srv://hashnirehana_db_user:gXkA60GwMMhhf5DS@cluster0.avpgqvx.mongodb.net/StudyMate";

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB');
    const reqs = await LecturerRequest.find().populate('user');
    for (const r of reqs) {
      if (r.name === 'Saman Perera' || r.name === 'Nethmi Fernando') {
        if (r.user) {
          r.user.degree = 'BSc Information Technology';
          await r.user.save();
        }
        r.department = 'BSc Information Technology';
        await r.save();
        console.log(`Updated ${r.name}`);
      }
    }
    console.log('Update finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
