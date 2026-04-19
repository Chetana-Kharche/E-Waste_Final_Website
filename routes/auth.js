const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Minimal Auth for Demo (No bcrypt/JWT for simplicity of UI/UX project, but functional)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });
        
        const user = new User({ name, email, password, role: role || 'user' });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        
        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, phone, address }, { new: true });
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin block user
router.put('/:id/block', async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
        res.json({ message: isBlocked ? 'User blocked' : 'User unblocked', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin delete user
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
