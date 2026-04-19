const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// User submits waste
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { userId, wasteType, weight, pickupAddress, pickupTime } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Photo is required' });

        const submission = new Submission({
            userId,
            wasteType,
            weight: Number(weight),
            photoUrl: `/uploads/${req.file.filename}`,
            pickupAddress,
            pickupTime
        });

        await submission.save();
        res.status(201).json({ message: 'Submission successful', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin gets all submissions
router.get('/', async (req, res) => {
    try {
        const submissions = await Submission.find().populate('userId', 'name email');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User gets their own submissions
router.get('/user/:userId', async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin approves submission
router.put('/:id/approve', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Not found' });
        if (submission.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

        submission.status = 'approved';
        await submission.save();

        await Notification.create({
            userId: submission.userId,
            message: `Your pickup request for ${submission.wasteType} has been approved.`
        });

        res.json({ message: 'Approved successfully', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin assigns worker
router.put('/:id/assign', async (req, res) => {
    try {
        const { workerName } = req.body;
        const submission = await Submission.findByIdAndUpdate(req.params.id, { assignedWorkerName: workerName }, { new: true });
        
        await Notification.create({
            userId: submission.userId,
            message: `A worker (${workerName}) has been assigned to your pickup.`
        });

        res.json({ message: 'Worker assigned', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin marks completed and awards points
router.put('/:id/complete', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Not found' });
        if (submission.status === 'completed') return res.status(400).json({ error: 'Already completed' });

        submission.status = 'completed';
        await submission.save();

        const pointsEarned = submission.weight * 10;
        const co2SavedAmount = submission.weight * 1.4;

        await User.findByIdAndUpdate(submission.userId, {
            $inc: {
                totalKg: submission.weight,
                rewardPoints: pointsEarned,
                co2Saved: co2SavedAmount
            }
        });

        await Notification.create({
            userId: submission.userId,
            message: `Your pickup is completed! You earned ${pointsEarned} points.`
        });

        res.json({ message: 'Completed successfully', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin rejects submission
router.put('/:id/reject', async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        
        await Notification.create({
            userId: submission.userId,
            message: `Your pickup request for ${submission.wasteType} was rejected.`
        });

        res.json({ message: 'Rejected successfully', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
