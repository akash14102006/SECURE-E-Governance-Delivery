const express = require('express');
const router = express.Router();
const webauthn = require('./webauthn');

// GET /auth/status?userId=xxx
router.get('/status', (req, res) => {
    const { userId } = req.query;
    res.json({ registered: webauthn.isRegistered(userId || 'citizen123') });
});

// GET /auth/register-options?userId=xxx&userName=xxx
router.get('/register-options', async (req, res) => {
    const userId = req.query.userId || 'citizen123';
    const userName = req.query.userName || 'citizen@secgov.in';
    try {
        const options = await webauthn.getRegistrationOptions(userId, userName);
        res.json(options);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /auth/register-verify
router.post('/register-verify', async (req, res) => {
    const { userId, userName, response } = req.body;
    try {
        const result = await webauthn.verifyRegistration(userId || 'citizen123', userName || 'citizen@secgov.in', response);
        res.json(result);
    } catch (err) {
        res.status(400).json({ verified: false, error: err.message });
    }
});

// GET /auth/login-options?userId=xxx
router.get('/login-options', async (req, res) => {
    const userId = req.query.userId || 'citizen123';
    try {
        const options = await webauthn.getAuthOptions(userId);
        res.json(options);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /auth/login-verify
router.post('/login-verify', async (req, res) => {
    const { userId, response } = req.body;
    try {
        const result = await webauthn.verifyAuth(userId || 'citizen123', response);
        res.json(result);
    } catch (err) {
        res.status(400).json({ verified: false, error: err.message });
    }
});

module.exports = router;
