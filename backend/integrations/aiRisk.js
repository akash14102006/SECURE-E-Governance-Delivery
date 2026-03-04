const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * Isolation Forest + LSTM simulation
 * Real call goes to Python FastAPI service on port 8000
 */
async function getRiskScore(userProfile) {
    try {
        const res = await axios.post(`${AI_ENGINE_URL}/predict`, userProfile, { timeout: 3000 });
        return {
            risk_score: res.data.risk_score,
            risk_level: res.data.risk_level,
            model: res.data.model || 'isolation_forest',
            features_used: res.data.features_used,
            source: 'ai_engine_live'
        };
    } catch {
        // Local simulation mimicking Isolation Forest + LSTM logic
        return simulateRiskScore(userProfile);
    }
}

function simulateRiskScore(profile = {}) {
    let score = 0.05;

    // LSTM: behavioural frequency anomaly
    const freq = profile.request_frequency || profile.requestFreq || 50;
    if (freq > 150) score += 0.45;
    else if (freq > 80) score += 0.2;

    // Isolation Forest: geolocation anomaly
    const knownLocations = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad'];
    const location = profile.login_location || profile.location || 'Delhi';
    if (!knownLocations.includes(location)) score += 0.3;
    if (location === 'unknown') score += 0.2;

    // Graph ML: device fingerprint anomaly
    if (profile.device_fingerprint === 'unknown') score += 0.25;

    // Bot probability
    const botProb = profile.bot_prob || 0;
    score += botProb * 0.4;

    score = Math.min(score, 1.0);
    const risk_level = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';

    return {
        risk_score: parseFloat(score.toFixed(2)),
        risk_level,
        model: 'isolation_forest_local',
        features_used: ['request_frequency', 'login_location', 'device_fingerprint', 'bot_probability'],
        source: 'simulated'
    };
}

async function getRiskDistribution() {
    // Returns risk breakdown for the pie chart
    return [
        { name: 'Low Risk', value: 72, color: '#DDF7EC' },
        { name: 'Medium Risk', value: 23, color: '#FFD9CC' },
        { name: 'High Risk', value: 5, color: '#FCA5A5' },
    ];
}

module.exports = { getRiskScore, simulateRiskScore, getRiskDistribution };
