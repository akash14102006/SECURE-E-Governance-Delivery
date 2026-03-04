const express = require('express');
const router = express.Router();

// In production this would query PostgreSQL:
// SELECT * FROM citizen_access_logs ORDER BY timestamp DESC LIMIT 50
// For now, we serve realistic mock data matching the schema.
const accessLogs = [
    { id: 1, officer: 'Sarah Johnson', role: 'Tax Officer', department: 'Revenue', purpose: 'Tax Verification', data_accessed: 'Income Records', risk_score: 0.12, timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 2, officer: 'Michael Chen', role: 'Admin', department: 'IT', purpose: 'System Audit', data_accessed: 'System Config', risk_score: 0.02, timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 3, officer: 'James Wilson', role: 'Tax Officer', department: 'Revenue', purpose: 'Record Update', data_accessed: 'Property Tax', risk_score: 0.45, timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: 4, officer: 'Priya Patel', role: 'Auditor', department: 'Compliance', purpose: 'Compliance Check', data_accessed: 'GST Records', risk_score: 0.08, timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString() },
    { id: 5, officer: 'David Kumar', role: 'Tax Officer', department: 'Revenue', purpose: 'Tax Verification', data_accessed: 'Land Records', risk_score: 0.31, timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString() },
];

router.get('/logs', (req, res) => {
    res.json(accessLogs.map(log => ({
        ...log,
        risk: `${Math.round(log.risk_score * 100)}%`,
        time: new Date(log.timestamp).toLocaleTimeString()
    })));
});

router.post('/log', (req, res) => {
    const entry = {
        id: accessLogs.length + 1,
        ...req.body,
        timestamp: new Date().toISOString()
    };
    accessLogs.unshift(entry);
    res.status(201).json(entry);
});

module.exports = router;
