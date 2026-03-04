const express = require('express');
const router = express.Router();
const { evaluatePolicy } = require('../integrations/opa');
const { getRiskScore } = require('../integrations/aiRisk');

router.post('/validate', async (req, res) => {
    const { role, purpose, risk_score, user_data } = req.body;

    // If no risk_score provided, compute it from AI engine
    let finalRiskScore = risk_score;
    if (finalRiskScore === undefined && user_data) {
        const aiResult = await getRiskScore(user_data);
        finalRiskScore = aiResult.risk_score;
    }

    const decision = await evaluatePolicy({ role, purpose, risk_score: finalRiskScore });

    res.json({
        allowed: decision.allowed,
        decision: decision.reason,
        risk_score: finalRiskScore,
        timestamp: new Date().toISOString(),
        policy_source: decision.source,
    });
});

router.get('/logs', (req, res) => {
    res.json([
        { id: 1, action: 'Allow', role: 'tax_officer', purpose: 'tax_verification', risk: 0.12, time: new Date(Date.now() - 2 * 60000).toISOString() },
        { id: 2, action: 'Deny', role: 'clerk', purpose: 'record_update', risk: 0.85, time: new Date(Date.now() - 8 * 60000).toISOString() },
        { id: 3, action: 'Allow', role: 'admin', purpose: 'system_audit', risk: 0.03, time: new Date(Date.now() - 15 * 60000).toISOString() },
    ]);
});

module.exports = router;
