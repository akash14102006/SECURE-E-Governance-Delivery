import { Eye, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Toggle } from '../components/Toggle';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const FALLBACK_LOGS = [
  { id: 1, officer: 'Sarah Johnson', role: 'Tax Officer', department: 'Revenue Services', purpose: 'Tax Verification', dataAccessed: 'Income Records', timestamp: '2026-03-04 14:32:15', riskScore: 0.12, status: 'approved', duration: '2 minutes' },
  { id: 2, officer: 'Michael Chen', role: 'Healthcare Admin', department: 'Health Services', purpose: 'Medical Record Review', dataAccessed: 'Health Data', timestamp: '2026-03-04 13:15:42', riskScore: 0.08, status: 'approved', duration: '5 minutes' },
  { id: 3, officer: 'Unknown User', role: 'Unauthorized', department: 'Unknown', purpose: 'Unauthorized Access', dataAccessed: 'Personal Information', timestamp: '2026-03-04 11:45:23', riskScore: 0.95, status: 'denied', duration: 'N/A' },
  { id: 4, officer: 'Emily Rodriguez', role: 'Social Services', department: 'Welfare Department', purpose: 'Benefits Eligibility', dataAccessed: 'Employment History', timestamp: '2026-03-04 10:20:11', riskScore: 0.15, status: 'approved', duration: '3 minutes' },
  { id: 5, officer: 'David Kim', role: 'Law Enforcement', department: 'Police Department', purpose: 'Investigation', dataAccessed: 'Criminal Records', timestamp: '2026-03-04 09:05:37', riskScore: 0.42, status: 'flagged', duration: '8 minutes' },
];

export function TransparencyDashboard() {
  const [accessLogs, setAccessLogs] = useState(FALLBACK_LOGS);

  const [privacyControls, setPrivacyControls] = useState([
    { label: 'Email Notifications', description: 'Get notified when data is accessed', enabled: true },
    { label: 'Access Alerts', description: 'Real-time alerts for high-risk access', enabled: true },
    { label: 'Download Reports', description: 'Monthly transparency reports', enabled: false },
    { label: 'Data Sharing Preferences', description: 'Control inter-department sharing', enabled: true },
  ]);

  useEffect(() => {
    fetch('http://localhost:5000/api/transparency/logs')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const mapped = data.map((log: any) => ({
            id: log.id,
            officer: log.officer,
            role: log.role,
            department: log.department || 'Gov. Services',
            purpose: log.purpose,
            dataAccessed: log.data_accessed || log.accessed,
            timestamp: log.timestamp || log.time,
            riskScore: log.risk_score || parseFloat((log.risk || '0%').replace('%', '')) / 100,
            status: (log.risk_score || 0) > 0.7 ? 'denied' : 'approved',
            duration: '—',
          }));
          setAccessLogs(mapped);
        }
      })
      .catch(() => { });

    // Real-time: new high-risk events add flagged entries
    socket.on('security_event', (event) => {
      if (event.risk_level === 'high' && event.ip) {
        setAccessLogs(prev => [{
          id: Date.now(),
          officer: `Unknown — ${event.ip}`,
          role: 'Unauthorized',
          department: 'External',
          purpose: event.type?.replace(/_/g, ' ') || 'Automated threat',
          dataAccessed: 'System Resources',
          timestamp: new Date().toLocaleString(),
          riskScore: event.risk_score || 0.9,
          status: 'denied',
          duration: 'N/A',
        }, ...prev.slice(0, 4)]);
      }
    });

    return () => { socket.off('security_event'); };
  }, []);

  const toggleControl = (index: number) => {
    const newControls = [...privacyControls];
    newControls[index].enabled = !newControls[index].enabled;
    setPrivacyControls(newControls);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl mb-2 text-gray-800">Transparency Dashboard</h1>
        <p className="text-gray-600">Track who accessed your data and why</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Eye, label: 'Total Access Requests', value: '247', color: 'blue' },
          { icon: CheckCircle, label: 'Approved', value: '223', color: 'green' },
          { icon: XCircle, label: 'Denied', value: '18', color: 'red' },
          { icon: AlertCircle, label: 'Flagged', value: '6', color: 'orange' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
          >
            <GlassCard className="p-6" hover>
              <div className="backdrop-blur-[24px] bg-white/60 rounded-xl p-3 mb-4 w-fit">
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="text-2xl mb-1 text-gray-800">{stat.value}</div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Access Logs Timeline */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-6 text-gray-800">Recent Data Access Logs</h3>
          <div className="space-y-4">
            {accessLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="relative"
              >
                {/* Timeline Line */}
                {index < accessLogs.length - 1 && (
                  <div className="absolute left-[19px] top-10 w-[2px] h-full bg-gradient-to-b from-blue-300 to-transparent" />
                )}

                <div className="flex gap-4">
                  {/* Timeline Dot */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.status === 'approved' ? 'bg-green-100' :
                        log.status === 'denied' ? 'bg-red-100' :
                          'bg-orange-100'
                      }`}>
                      {log.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : log.status === 'denied' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  </div>

                  {/* Log Card */}
                  <div className="flex-1 backdrop-blur-[24px] bg-white/40 rounded-xl p-5 border border-white/60 hover:bg-white/60 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base text-gray-800">{log.officer}</h4>
                          <StatusBadge status={
                            log.status === 'approved' ? 'protected' :
                              log.status === 'denied' ? 'critical' :
                                'warning'
                          }>
                            {log.status.toUpperCase()}
                          </StatusBadge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {log.role}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {log.department}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">{log.timestamp}</div>
                        <div className={`text-sm px-2 py-1 rounded ${log.riskScore < 0.3 ? 'bg-green-100 text-green-700' :
                            log.riskScore < 0.6 ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          Risk: {(log.riskScore * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Purpose</p>
                        <p className="text-sm text-gray-800">{log.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Data Accessed</p>
                        <p className="text-sm text-gray-800">{log.dataAccessed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm text-gray-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.duration}
                        </p>
                      </div>
                    </div>

                    {/* AI Decision Explanation */}
                    <div className="mt-4 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                      <p className="text-xs text-blue-800">
                        <span className="font-medium">AI Decision:</span>{' '}
                        {log.status === 'approved'
                          ? 'Access granted based on verified role, low risk score, and policy compliance.'
                          : log.status === 'denied'
                            ? 'Access denied due to unauthorized role and high risk score. Security team notified.'
                            : 'Access flagged for manual review due to elevated risk score. Requires supervisor approval.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Privacy Controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-4 text-gray-800">Your Privacy Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {privacyControls.map((control, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/30">
                <div>
                  <p className="text-sm text-gray-800 mb-1">{control.label}</p>
                  <p className="text-xs text-gray-500">{control.description}</p>
                </div>
                <Toggle
                  enabled={control.enabled}
                  onToggle={() => toggleControl(index)}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}