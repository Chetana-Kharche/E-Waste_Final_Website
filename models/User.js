const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBlocked: { type: Boolean, default: false },
    totalKg: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
