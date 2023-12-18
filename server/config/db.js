const mongoose = require('mongoose');

const connectDB = async (db) => {
    try {
        await mongoose.connect(db);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;