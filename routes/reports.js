const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

router.get('/monthly', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        
        const data = await Submission.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    date: { 
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                } 
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    totalWeight: { $sum: "$weight" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
