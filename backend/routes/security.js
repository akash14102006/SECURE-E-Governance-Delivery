const express = require('express');
const router = express.Router();
const { readSuricataLogs, getAttackChartData } = require('../integrations/suricata');
const { getTrafficAnalytics, getDDoSEvents } = require('../integrations/cloudflare');
const { getBlockedIPs, getDecisionCount } = require('../integrations/crowdsec');
const { getSecurityEvents } = require('../integrations/wazuh');
const { getRiskDistribution } = require('../integrations/aiRisk');

router.get('/metrics', async (req, res) => {
    const [trafficData, blockedIPs] = await Promise.all([
        getTrafficAnalytics(),
        getDecisionCount()
    ]);
    res.json({
        activeThreats: Math.floor(Math.random() * 3),
        blockedAttacks: 1247 + Math.floor(Math.random() * 200),
        citizenAccess: 8492 + Math.floor(Math.random() * 300),
        policyDecisions: 3156 + Math.floor(Math.random() * 100),
        threatPreventionRate: parseFloat((97.5 + Math.random() * 2).toFixed(1)),
        botTraffic: trafficData.botTraffic,
        humanTraffic: trafficData.humanTraffic,
        blockedIPs,
    });
});

router.get('/events', async (req, res) => {
    const events = await getSecurityEvents();
    res.json(events);
});

router.get('/attacks', async (req, res) => {
    const chartData = getAttackChartData();
    res.json(chartData);
});

router.get('/threats', async (req, res) => {
    const timeline = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map(time => ({
        time,
        blocked: Math.floor(Math.random() * 110) + 20,
        allowed: Math.floor(Math.random() * 400) + 200,
    }));
    res.json(timeline);
});

router.get('/risk', async (req, res) => {
    const data = await getRiskDistribution();
    res.json(data);
});

router.get('/intrusions', async (req, res) => {
    const ids = readSuricataLogs();
    const ips = await getBlockedIPs();
    const combined = [...ids, ...ips.map(ip => ({
        severity: 'high',
        type: ip.scenario?.split('/')[1]?.replace(/-/g, ' ') || 'Anomaly',
        ip: ip.ip,
        action: ip.action,
        time: ip.time,
        source: ip.source
    }))];
    res.json(combined.slice(0, 10));
});

router.get('/ddos', async (req, res) => {
    const events = await getDDoSEvents();
    res.json(events);
});

router.get('/securityScore', (req, res) => {
    res.json([
        { subject: 'Firewall', score: 90 + Math.floor(Math.random() * 8) },
        { subject: 'IDS/IPS', score: 88 + Math.floor(Math.random() * 10) },
        { subject: 'Encryption', score: 96 + Math.floor(Math.random() * 4) },
        { subject: 'Access Control', score: 85 + Math.floor(Math.random() * 10) },
        { subject: 'Data Privacy', score: 91 + Math.floor(Math.random() * 7) },
        { subject: 'Audit Logs', score: 88 + Math.floor(Math.random() * 8) },
    ]);
});

module.exports = router;
