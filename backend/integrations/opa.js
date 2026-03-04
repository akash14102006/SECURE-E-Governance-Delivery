const axios = require('axios');

const OPA_URL = process.env.OPA_URL || 'http://localhost:8181';

/**
 * Evaluate access policy against OPA
 * Maps to the policy.rego rule:
 *   allow if role == "tax_officer" AND risk_score < 0.7
 */
async function evaluatePolicy(input) {
    try {
        const res = await axios.post(
            `${OPA_URL}/v1/data/security/policy`,
            { input },
            { timeout: 3000 }
        );
        const result = res.data.result;
        return {
            allowed: result.allow,
            reason: result.decision?.reason || (result.allow ? 'Policy Approved' : 'Policy Denied'),
            source: 'opa_live'
        };
    } catch {
        // Fallback policy engine when OPA container not running
        return evaluatePolicyLocally(input);
    }
}

function evaluatePolicyLocally(input) {
    const { role, purpose, risk_score } = input;

    // Mirror opa/policy.rego logic
    if (role === 'admin') {
        return { allowed: true, reason: 'Admin override — full access granted', source: 'local_policy' };
    }

    if (role === 'tax_officer' && purpose === 'tax_verification' && risk_score < 0.7) {
        return { allowed: true, reason: 'Approved — Tax officer with low risk accessing permitted resource', source: 'local_policy' };
    }

    if (risk_score >= 0.7) {
        return { allowed: false, reason: `Denied — AI risk score ${risk_score} exceeds threshold of 0.7`, source: 'local_policy' };
    }

    return { allowed: false, reason: `Denied — Role '${role}' not permitted for purpose '${purpose}'`, source: 'local_policy' };
}

module.exports = { evaluatePolicy, evaluatePolicyLocally };
