const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    contact: { type: String }
});

module.exports = mongoose.model('Center', centerSchema);
