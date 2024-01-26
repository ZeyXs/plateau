const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    roles: {
        type: Map,
        of: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: false,
    },
    profilePicture: { type: String },
    stats: { type: Map }
});

module.exports = mongoose.model('users', UserSchema);
