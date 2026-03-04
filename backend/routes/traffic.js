const express = require('express');
const router = express.Router();
const { getTrafficAnalytics } = require('../integrations/cloudflare');

router.get('/analysis', async (req, res) => {
    const current = await getTrafficAnalytics();

    // Build 24h timeline from current reading
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    const timeline = hours.map((time, i) => {
        const factor = 0.6 + (i * 0.1);
        return {
            time,
            bot: Math.floor(current.botTraffic * factor * (0.8 + Math.random() * 0.4)),
            human: Math.floor(current.humanTraffic * factor * (0.8 + Math.random() * 0.4)),
        };
    });

    res.json({
        timeline,
        current,
    });
});

module.exports = router;
