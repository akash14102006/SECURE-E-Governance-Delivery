const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Routes
const securityRoutes = require('./routes/security');
const trafficRoutes = require('./routes/traffic');
const policyRoutes = require('./routes/policy');
const transparencyRoutes = require('./routes/transparency');
const authRoutes = require('./auth/routes');

// Integrations
const kafkaIntegration = require('./integrations/kafka');
const { simulateRiskScore } = require('./integrations/aiRisk');

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/security', securityRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/transparency', transparencyRoutes);
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Wire Kafka broadcaster to socket.io
kafkaIntegration.setBroadcaster((event, data) => io.emit(event, data));

// Start Kafka consumer (non-blocking, gracefully degrades)
kafkaIntegration.startKafkaConsumer();

// Simulator / External tools POST events here
app.post('/api/events', async (req, res) => {
  const event = req.body;

  // AI Risk assessment on every event
  if (event.ip && !event.risk_score) {
    const profile = {
      request_frequency: event.request_freq || 80,
      login_location: event.location || 'unknown',
      bot_prob: event.bot_prob || 0.6,
    };
    const risk = simulateRiskScore(profile);
    event.risk_score = risk.risk_score;
    event.risk_level = risk.risk_level;
  }

  // Broadcast to all dashboard clients via socket.io
  io.emit('security_event', event);
  res.status(200).json({ status: 'broadcasted', event });
});

io.on('connection', (socket) => {
  console.log('[WS] Dashboard client connected:', socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   GOVTECH SECURITY COMMAND CENTER BACKEND    ║
║   Port: ${PORT}  |  All systems nominal         ║
╠══════════════════════════════════════════════╣
║  Routes: /api/security  /api/traffic         ║
║          /api/policy    /api/transparency    ║
╠══════════════════════════════════════════════╣
║  Integrations: Cloudflare · Suricata         ║
║    CrowdSec · Wazuh · Kafka · OPA · AI       ║
╚══════════════════════════════════════════════╝
  `);
});
