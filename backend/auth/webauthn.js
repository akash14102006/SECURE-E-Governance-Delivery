const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

// In-memory store (replace with PostgreSQL in production)
const users = new Map();
const challenges = new Map();

const RP_ID = process.env.RP_ID || 'localhost';
const RP_NAME = process.env.RP_NAME || 'SECURE SERVICE DELIVERY';
const ORIGIN = process.env.AUTH_ORIGIN || 'http://localhost:5173';

// --- REGISTRATION ---
async function getRegistrationOptions(userId, userName) {
    // If user exists, return their existing credential IDs to exclude re-registration
    const user = users.get(userId) || { credentials: [] };

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: Buffer.from(userId),
        userName,
        attestationType: 'none',
        excludeCredentials: user.credentials.map(c => ({
            id: c.credentialID,
            type: 'public-key',
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    // Store challenge for verification
    challenges.set(userId, options.challenge);
    return options;
}

async function verifyRegistration(userId, userName, response) {
    const expectedChallenge = challenges.get(userId);
    if (!expectedChallenge) throw new Error('No challenge found — session expired');

    const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;
        const existingUser = users.get(userId) || { id: userId, userName, credentials: [] };
        existingUser.credentials.push({
            credentialID: credential.id,
            publicKey: credential.publicKey,
            counter: credential.counter,
        });
        users.set(userId, existingUser);
        challenges.delete(userId);
    }

    return { verified: verification.verified };
}

// --- AUTHENTICATION ---
async function getAuthOptions(userId) {
    const user = users.get(userId);
    const allowCredentials = user?.credentials?.map(c => ({
        id: c.credentialID,
        type: 'public-key',
    })) || [];

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'preferred',
        allowCredentials,
    });

    challenges.set(`auth_${userId}`, options.challenge);
    return options;
}

async function verifyAuth(userId, response) {
    const user = users.get(userId);
    if (!user) throw new Error('User not registered');

    const expectedChallenge = challenges.get(`auth_${userId}`);
    if (!expectedChallenge) throw new Error('No auth challenge found');

    const credRecord = user.credentials.find(c => c.credentialID === response.id);
    if (!credRecord) throw new Error('Credential not found for this user');

    const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
            id: credRecord.credentialID,
            publicKey: credRecord.publicKey,
            counter: credRecord.counter,
        },
    });

    if (verification.verified) {
        credRecord.counter = verification.authenticationInfo.newCounter;
        challenges.delete(`auth_${userId}`);
    }

    return { verified: verification.verified };
}

function isRegistered(userId) {
    const user = users.get(userId);
    return user && user.credentials.length > 0;
}

module.exports = { getRegistrationOptions, verifyRegistration, getAuthOptions, verifyAuth, isRegistered };
