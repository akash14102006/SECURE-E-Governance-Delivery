const axios = require('axios');

const CROWDSEC_URL = process.env.CROWDSEC_URL || 'http://localhost:8080';
const CROWDSEC_API_KEY = process.env.CROWDSEC_API_KEY || '';

async function getBlockedIPs() {
    try {
        const res = await axios.get(`${CROWDSEC_URL}/v1/alerts`, {
            headers: { 'X-Api-Key': CROWDSEC_API_KEY },
            timeout: 3000
        });
        return res.data.map(alert => ({
            ip: alert.source?.ip || 'Unknown',
            scenario: alert.scenario,
            decisions: alert.decisions?.length || 0,
            country: alert.source?.cn || '??',
            action: 'Blocked',
            time: alert.start_at,
            source: 'crowdsec_live'
        }));
    } catch {
        // Simulation fallback
        return [
            { ip: '185.220.101.45', scenario: 'crowdsecurity/http-probing', decisions: 3, country: 'RU', action: 'Blocked', time: new Date().toISOString(), source: 'simulated' },
            { ip: '92.118.160.11', scenario: 'crowdsecurity/ssh-bf', decisions: 12, country: 'CN', action: 'Banned', time: new Date(Date.now() - 5 * 60000).toISOString(), source: 'simulated' },
            { ip: '45.142.212.100', scenario: 'crowdsecurity/portscan', decisions: 1, country: 'US', action: 'Blocked', time: new Date(Date.now() - 20 * 60000).toISOString(), source: 'simulated' },
        ];
    }
}

async function getDecisionCount() {
    try {
        const ips = await getBlockedIPs();
        return ips.reduce((sum, a) => sum + (a.decisions || 1), 0);
    } catch {
        return 1892;
    }
}

module.exports = { getBlockedIPs, getDecisionCount };
