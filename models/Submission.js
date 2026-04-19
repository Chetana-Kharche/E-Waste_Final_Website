const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wasteType: { type: String, required: true },
    weight: { type: Number, required: true }, // in kg
    photoUrl: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    pickupTime: { type: Date, required: true },
    assignedWorkerName: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
