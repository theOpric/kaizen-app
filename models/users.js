const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-find-or-create');

const userSchema = new Schema({
    googleID: {
        type: String,
        unique: true
    },
    name: String,
    surname: String,
    profileFotoURL: String,
    fbOnline: Number,
    fbSearch: Number,
    fbMatch: String,
    socketID: String,
});
userSchema.plugin(findOrCreate);
module.exports = mongoose.model('users', userSchema);