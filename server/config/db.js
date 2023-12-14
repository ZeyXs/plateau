const mongoose = require('mongoose');

const connectDB = async db => {
  try {
    await mongoose.connect(db);
    console.log('Connected to MangoDB');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
