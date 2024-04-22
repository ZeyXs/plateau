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
        default: { User: 2001 },
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
    profilePicture: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
        required: true,
    },
    coins: {
        type: Number,
        default: 0,
        required: true,
    },
    stats: {
        type: Map,
        default: {
            "bataille": {
                "gamesPlayed": 0,
                "wins":0,
                "loses":0
            },
            "sixQuiPrend": {
                "gamesPlayed": 0,
                "wins":0,
                "loses":0,
                "avgPointsPerGame": 0
            },
            "milleBornes": {
                "gamesPlayed": 0,
                "wins":0,
                "loses":0
            }
        },
        required: true
    },
    items: {
        type: Map,
        default: {},
        required: true,
    }
});

module.exports = mongoose.model('users', UserSchema);