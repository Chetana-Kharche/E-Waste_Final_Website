const express = require('express');
const router = express.Router();
const Center = require('../models/Center');

router.get('/', async (req, res) => {
    try {
        const centers = await Center.find();
        res.json(centers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed data route for testing if python script not run
router.post('/seed', async (req, res) => {
    try {
        await Center.deleteMany({});
        const centers = [
            { name: "EcoTech Recycling", address: "123 Green Ave, Tech Park", city: "Metropolis" },
            { name: "Green Earth E-Waste", address: "45 Nature Blvd", city: "Metropolis" },
            { name: "SafeRecycle Co", address: "788 Industrial Way", city: "Metropolis" }
        ];
        await Center.insertMany(centers);
        res.json({ message: "Seeded centers" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
