const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    baseRewardPoints: { type: Number, required: true, default: 10 }
});

module.exports = mongoose.model('Category', categorySchema);
