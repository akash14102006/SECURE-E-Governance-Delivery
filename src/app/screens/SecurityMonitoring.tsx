import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Server, Zap, Bug } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export function SecurityMonitoring() {
  const [attackData, setAttackData] = useState([
    { time: '00:00', ddos: 12, sql: 5, xss: 3, bruteforce: 8 },
    { time: '04:00', ddos: 8, sql: 3, xss: 2, bruteforce: 4 },
    { time: '08:00', ddos: 25, sql: 12, xss: 7, bruteforce: 15 },
    { time: '12:00', ddos: 45, sql: 18, xss: 12, bruteforce: 22 },
    { time: '16:00', ddos: 67, sql: 25, xss: 18, bruteforce: 32 },
    { time: '20:00', ddos: 34, sql: 15, xss: 9, bruteforce: 18 },
  ]);

  const [trafficData, setTrafficData] = useState([
    { time: '00:00', bot: 120, human: 450 },
    { time: '04:00', bot: 89, human: 380 },
    { time: '08:00', bot: 156, human: 680 },
    { time: '12:00', bot: 203, human: 890 },
    { time: '16:00', bot: 178, human: 920 },
    { time: '20:00', bot: 134, human: 720 },
  ]);

  const [securityScore, setSecurityScore] = useState([
    { subject: 'Firewall', score: 95 },
    { subject: 'IDS/IPS', score: 92 },
    { subject: 'Encryption', score: 98 },
    { subject: 'Access Control', score: 88 },
    { subject: 'Data Privacy', score: 94 },
    { subject: 'Audit Logs', score: 90 },
  ]);

  const [alerts, setAlerts] = useState([
    { severity: 'high', type: 'SQL Injection', ip: '185.220.101.45', action: 'Blocked', time: '2 min ago' },
    { severity: 'medium', type: 'Port Scanning', ip: '203.0.113.89', action: 'Blocked', time: '12 min ago' },
    { severity: 'high', type: 'DDoS Attempt', ip: '198.51.100.23', action: 'Mitigated', time: '45 min ago' },
    { severity: 'low', type: 'Invalid Auth', ip: '192.0.2.156', action: 'Logged', time: '1 hour ago' },
    { severity: 'medium', type: 'XSS Attempt', ip: '172.16.254.1', action: 'Blocked', time: '2 hours ago' },
  ]);

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:5000/api/security/attackData').then(res => res.json()).then(setAttackData);
    fetch('http://localhost:5000/api/security/trafficData').then(res => res.json()).then(setTrafficData);
    fetch('http://localhost:5000/api/security/securityScore').then(res => res.json()).then(setSecurityScore);

    // Socket listeners
    socket.on('state_update', (state) => {
      setAttackData(state.attackData);
      setTrafficData(state.trafficData);
      setSecurityScore(state.securityScore);
    });

    socket.on('security_event', (event) => {
      if (event.type === 'ddos_block') {
        setAlerts(prev => [{
          severity: 'high',
          type: 'DDoS Attempt',
          ip: event.ip,
          action: 'Blocked',
          time: 'Just now'
        }, ...prev.slice(0, 4)]);
      }
    });

    return () => {
      socket.off('state_update');
      socket.off('security_event');
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl mb-2 text-gray-800">Security Monitoring</h1>
        <p className="text-gray-600">Real-time threat detection and network protection</p>
      </motion.div>

      {/* Threat Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Shield, label: 'DDoS Protection', value: 'Active', status: 'protected' as const, detail: '0 active attacks' },
          { icon: Bug, label: 'IDS/IPS', value: 'Monitoring', status: 'protected' as const, detail: '24/7 surveillance' },
          { icon: Zap, label: 'Firewall', value: 'Enabled', status: 'protected' as const, detail: '1,247 blocked' },
          { icon: AlertTriangle, label: 'Threat Level', value: 'Low', status: 'protected' as const, detail: 'No critical alerts' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
          >
            <GlassCard className="p-6" hover>
              <div className="backdrop-blur-[24px] bg-white/60 rounded-xl p-3 mb-4 w-fit">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mb-3">
                <StatusBadge status={stat.status}>{stat.value}</StatusBadge>
              </div>
              <h3 className="text-sm mb-1 text-gray-600">{stat.label}</h3>
              <p className="text-xs text-gray-500">{stat.detail}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Attack Types Chart */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-4 text-gray-800">Blocked Attack Types (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attackData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  backdropFilter: 'blur(24px)',
                }}
              />
              <Bar dataKey="ddos" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
              <Bar dataKey="sql" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
              <Bar dataKey="xss" fill="#FFD93D" radius={[8, 8, 0, 0]} />
              <Bar dataKey="bruteforce" fill="#A78BFA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
            {[
              { label: 'DDoS', color: '#FF6B6B' },
              { label: 'SQL Injection', color: '#4ECDC4' },
              { label: 'XSS', color: '#FFD93D' },
              { label: 'Brute Force', color: '#A78BFA' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Traffic Analysis and Security Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot vs Human Traffic */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Traffic Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    backdropFilter: 'blur(24px)',
                  }}
                />
                <Line type="monotone" dataKey="bot" stroke="#FF6B6B" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="human" stroke="#4ECDC4" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                <span className="text-sm text-gray-600">Bot Traffic (Blocked)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
                <span className="text-sm text-gray-600">Human Traffic</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Security Posture Score */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Security Posture</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={securityScore}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    backdropFilter: 'blur(24px)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-3xl text-green-600 mb-1">93.2%</div>
              <p className="text-sm text-gray-600">Overall Security Score</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Live Intrusion Alerts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-4 text-gray-800">Recent Intrusion Attempts</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/30 hover:bg-white/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                  <div>
                    <p className="text-sm text-gray-800">{alert.type}</p>
                    <p className="text-xs text-gray-500">IP: {alert.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status="protected">{alert.action}</StatusBadge>
                  <span className="text-xs text-gray-500 w-20 text-right">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Network Status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-4 text-gray-800">Network Protection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Firewall Rules', value: '2,456', status: 'Active' },
              { label: 'Blocked IPs', value: '1,892', status: 'Quarantined' },
              { label: 'Security Patches', value: '100%', status: 'Up to date' },
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/30">
                <div className="text-2xl mb-2 text-gray-800">{item.value}</div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <StatusBadge status="protected">{item.status}</StatusBadge>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
