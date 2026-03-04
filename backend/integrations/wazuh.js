const axios = require('axios');

const WAZUH_URL = process.env.WAZUH_URL || 'http://localhost:55000';
const WAZUH_USER = process.env.WAZUH_USER || 'wazuh';
const WAZUH_PASS = process.env.WAZUH_PASS || 'wazuh';

let wazuhToken = null;

async function getAuthToken() {
    try {
        const res = await axios.get(`${WAZUH_URL}/security/user/authenticate`, {
            auth: { username: WAZUH_USER, password: WAZUH_PASS },
            timeout: 3000
        });
        wazuhToken = res.data.data.token;
        return wazuhToken;
    } catch {
        return null;
    }
}

async function getSecurityEvents() {
    try {
        const token = wazuhToken || await getAuthToken();
        if (!token) throw new Error('No auth token');

        const res = await axios.get(`${WAZUH_URL}/security/events`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 3000
        });
        return res.data.data.affected_items.map(e => ({
            type: e.rule?.level > 10 ? 'warning' : e.rule?.level > 7 ? 'info' : 'success',
            message: e.rule?.description || 'Security event detected',
            time: e.timestamp,
            agent: e.agent?.name,
            ruleId: e.rule?.id,
            source: 'wazuh_live'
        }));
    } catch {
        // Simulation fallback
        return [
            { type: 'success', message: 'DDoS attack successfully mitigated by Cloudflare', time: new Date(Date.now() - 2 * 60000).toISOString(), source: 'simulated' },
            { type: 'info', message: 'Policy engine approved 45 access requests', time: new Date(Date.now() - 15 * 60000).toISOString(), source: 'simulated' },
            { type: 'warning', message: 'Unusual login pattern detected from Singapore — blocked', time: new Date(Date.now() - 60 * 60000).toISOString(), source: 'simulated' },
            { type: 'success', message: 'System health check completed — all services nominal', time: new Date(Date.now() - 2 * 60 * 60000).toISOString(), source: 'simulated' },
            { type: 'warning', message: 'CrowdSec blocked SSH brute force from 92.118.160.11', time: new Date(Date.now() - 3 * 60 * 60000).toISOString(), source: 'simulated' },
        ];
    }
}

module.exports = { getSecurityEvents };
