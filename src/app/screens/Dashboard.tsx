import { useState, useEffect } from 'react';
import { Shield, Activity, Users, FileCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export function Dashboard() {
  const [metrics, setMetrics] = useState({
    activeThreats: 0,
    blockedAttacks: 1247,
    citizenAccess: 8492,
    policyDecisions: 3156,
    threatPreventionRate: 98.7
  });

  const [threatData, setThreatData] = useState([
    { time: '00:00', blocked: 45, allowed: 320 },
    { time: '04:00', blocked: 32, allowed: 280 },
    { time: '08:00', blocked: 67, allowed: 450 },
    { time: '12:00', blocked: 89, allowed: 520 },
    { time: '16:00', blocked: 123, allowed: 490 },
    { time: '20:00', blocked: 78, allowed: 410 },
  ]);

  const [riskData, setRiskData] = useState([
    { name: 'Low Risk', value: 72, color: '#DDF7EC' },
    { name: 'Medium Risk', value: 23, color: '#FFD9CC' },
    { name: 'High Risk', value: 5, color: '#FCA5A5' },
  ]);

  const [recentEvents, setRecentEvents] = useState([
    { type: 'success', message: 'DDoS attack successfully mitigated', time: '2 minutes ago' },
    { type: 'info', message: 'Policy engine approved 45 access requests', time: '15 minutes ago' },
    { type: 'warning', message: 'Unusual login pattern detected and blocked', time: '1 hour ago' },
    { type: 'success', message: 'System health check completed', time: '2 hours ago' },
  ]);

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:5000/api/security/metrics').then(res => res.json()).then(setMetrics);
    fetch('http://localhost:5000/api/security/threats').then(res => res.json()).then(setThreatData);
    fetch('http://localhost:5000/api/security/risk').then(res => res.json()).then(setRiskData);
    fetch('http://localhost:5000/api/security/events').then(res => res.json()).then(setRecentEvents);

    // Socket listeners
    socket.on('state_update', (state) => {
      setMetrics(state.metrics);
      setThreatData(state.threatData);
      setRiskData(state.riskData);
      setRecentEvents(state.recentEvents);
    });

    return () => {
      socket.off('state_update');
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
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">SECURE SERVICE DELIVERY</h1>
        <p className="text-sm tracking-wide text-gray-500 uppercase">Operational Security Control Center</p>
      </motion.div>

      {/* Hero Status Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-10 border-white/80 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-blue-300 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                <div className="relative backdrop-blur-xl bg-white/80 rounded-[2rem] p-7 border border-white/60 shadow-sm">
                  <Shield className="w-14 h-14 text-indigo-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800 tracking-tight">Real-Time Integrity Status</h2>
                <StatusBadge status="protected" className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider">
                  ENCRYPTED & PROTECTED
                </StatusBadge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-extrabold mb-1 bg-gradient-to-br from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                {metrics.threatPreventionRate}%
              </div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Prevention Efficacy</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Activity, label: 'Active Threats', value: metrics.activeThreats.toString(), status: 'protected' as const, trend: '↓ 45%' },
          { icon: Shield, label: 'Blocked Attacks', value: metrics.blockedAttacks.toLocaleString(), status: 'protected' as const, trend: '↑ 23%' },
          { icon: Users, label: 'Citizen Access', value: metrics.citizenAccess.toLocaleString(), status: 'neutral' as const, trend: '↑ 12%' },
          { icon: FileCheck, label: 'Policy Decisions', value: metrics.policyDecisions.toLocaleString(), status: 'neutral' as const, trend: '↑ 8%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
          >
            <GlassCard className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="backdrop-blur-[24px] bg-white/60 rounded-xl p-3">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl mb-1 text-gray-800">{stat.value}</div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Monitoring Chart */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Threat Monitoring (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={threatData}>
                <defs>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="blocked" stroke="#FF6B6B" fillOpacity={1} fill="url(#colorBlocked)" />
                <Area type="monotone" dataKey="allowed" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorAllowed)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                <span className="text-sm text-gray-600">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
                <span className="text-sm text-gray-600">Allowed</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Risk Score */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">AI Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    backdropFilter: 'blur(24px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {riskData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-4 text-gray-800">Recent Security Events</h3>
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/30 hover:bg-white/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{event.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
