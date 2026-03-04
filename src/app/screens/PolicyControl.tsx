import { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, XCircle, Clock, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

const socket = io(API_BASE_URL);

const STATIC_DECISIONS = [
  {
    id: 1,
    requestor: 'Tax Officer - Maria Garcia',
    resource: 'Citizen Tax Records',
    purpose: 'Annual Tax Verification',
    decision: 'approved',
    timestamp: '2026-03-04 14:45:30',
    policyRules: [
      { rule: 'Role Verification', passed: true, detail: 'Verified tax officer role' },
      { rule: 'Purpose Check', passed: true, detail: 'Valid tax verification purpose' },
      { rule: 'Risk Assessment', passed: true, detail: 'Risk score: 0.12 (Low)' },
      { rule: 'Time-based Access', passed: true, detail: 'Within business hours' },
    ],
  },
  {
    id: 2,
    requestor: 'Healthcare Worker - John Smith',
    resource: 'Tax Records',
    purpose: 'Medical Records Access',
    decision: 'denied',
    timestamp: '2026-03-04 13:22:15',
    policyRules: [
      { rule: 'Role Verification', passed: true, detail: 'Verified healthcare role' },
      { rule: 'Purpose Check', passed: false, detail: 'Healthcare role cannot access tax data' },
      { rule: 'Risk Assessment', passed: false, detail: 'Risk score: 0.87 (High)' },
      { rule: 'Data Classification', passed: false, detail: 'Cross-domain access denied' },
    ],
  },
  {
    id: 3,
    requestor: 'Social Worker - Emma Wilson',
    resource: 'Employment History',
    purpose: 'Benefits Assessment',
    decision: 'approved',
    timestamp: '2026-03-04 11:30:42',
    policyRules: [
      { rule: 'Role Verification', passed: true, detail: 'Verified social services role' },
      { rule: 'Purpose Check', passed: true, detail: 'Benefits assessment authorized' },
      { rule: 'Risk Assessment', passed: true, detail: 'Risk score: 0.18 (Low)' },
      { rule: 'Consent Verification', passed: true, detail: 'Citizen consent obtained' },
    ],
  },
  {
    id: 4,
    requestor: 'Police Officer - Robert Brown',
    resource: 'Personal Information',
    purpose: 'Investigation',
    decision: 'pending',
    timestamp: '2026-03-04 10:15:20',
    policyRules: [
      { rule: 'Role Verification', passed: true, detail: 'Verified law enforcement' },
      { rule: 'Warrant Check', passed: false, detail: 'Awaiting warrant approval' },
      { rule: 'Supervisor Approval', passed: false, detail: 'Pending supervisor review' },
      { rule: 'Risk Assessment', passed: true, detail: 'Risk score: 0.45 (Medium)' },
    ],
  },
];

export function PolicyControl() {
  const [policyDecisions, setPolicyDecisions] = useState(STATIC_DECISIONS);
  const [policyLogs, setPolicyLogs] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/policy/logs`)
      .then(res => res.json())
      .then(data => setPolicyLogs(data))
      .catch(() => { });

    socket.on('security_event', (event) => {
      if (event.risk_level === 'high') {
        setLiveEvents(prev => [
          `OPA DENIED — High-risk IP ${event.ip} (score: ${event.risk_score})`,
          ...prev.slice(0, 4)
        ]);
        setPolicyDecisions(prev => [{
          id: Date.now(),
          requestor: `AI Engine — ${event.ip}`,
          resource: 'System Access',
          purpose: event.type?.replace(/_/g, ' ') || 'Automated check',
          decision: 'denied',
          timestamp: new Date().toLocaleString(),
          policyRules: [
            { rule: 'Risk Assessment', passed: false, detail: `AI score: ${event.risk_score} (${event.risk_level}) — exceeds threshold` },
            { rule: 'IP Reputation', passed: false, detail: `Source: ${event.source || 'Unknown'}` },
          ],
        }, ...prev.slice(0, 3)]);
      }
    });

    return () => { socket.off('security_event'); };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl mb-2 text-gray-800">Policy Control Panel</h1>
        <p className="text-gray-600">AI-powered policy engine decisions and evaluations</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: FileCheck, label: 'Total Decisions', value: '3,156', color: 'blue' },
          { icon: CheckCircle, label: 'Approved', value: '2,847', color: 'green' },
          { icon: XCircle, label: 'Denied', value: '289', color: 'red' },
          { icon: Clock, label: 'Pending Review', value: '20', color: 'orange' },
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

      {/* Policy Decisions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-6 text-gray-800">Recent Policy Decisions</h3>
          <div className="space-y-6">
            {policyDecisions.map((decision, index) => (
              <motion.div
                key={decision.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="backdrop-blur-[24px] bg-white/40 rounded-xl p-6 border border-white/60 hover:bg-white/60 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base text-gray-800">{decision.requestor}</h4>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{decision.resource}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Purpose: {decision.purpose}</p>
                    <p className="text-xs text-gray-500">{decision.timestamp}</p>
                  </div>
                  <StatusBadge status={
                    decision.decision === 'approved' ? 'protected' :
                      decision.decision === 'denied' ? 'critical' :
                        'warning'
                  }>
                    {decision.decision.toUpperCase()}
                  </StatusBadge>
                </div>

                {/* Policy Rules Evaluation */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-3">Policy Evaluation Flow:</p>
                  <div className="space-y-3">
                    {decision.policyRules.map((rule, ruleIndex) => (
                      <div
                        key={ruleIndex}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/30"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {rule.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-gray-800">{rule.rule}</p>
                            <span className={`text-xs px-2 py-1 rounded ${rule.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {rule.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{rule.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Decision Reasoning */}
                <div className="mt-4 p-4 rounded-lg bg-purple-50/50 border border-purple-100">
                  <p className="text-xs text-purple-800">
                    <span className="font-medium">AI Policy Engine:</span>{' '}
                    {decision.decision === 'approved'
                      ? `Access granted. All policy rules satisfied. The requestor's role, purpose, and risk assessment align with governance policies. Decision made in ${Math.random() * 50 + 10}ms.`
                      : decision.decision === 'denied'
                        ? `Access denied. Policy violations detected. The request failed critical policy checks including purpose validation and risk assessment. Security team has been notified.`
                        : `Request pending manual review. Some policy rules require human approval. Supervisor notification sent. Estimated review time: 2-4 hours.`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Active Policies */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg mb-4 text-gray-800">Active Policy Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Role-Based Access Control', status: 'Active', rules: '45 rules' },
              { name: 'Time-Based Restrictions', status: 'Active', rules: '12 rules' },
              { name: 'Risk Score Thresholds', status: 'Active', rules: '8 rules' },
              { name: 'Cross-Domain Policies', status: 'Active', rules: '23 rules' },
              { name: 'Consent Requirements', status: 'Active', rules: '15 rules' },
              { name: 'Audit Logging', status: 'Active', rules: 'Mandatory' },
            ].map((policy, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/30"
              >
                <div>
                  <p className="text-sm text-gray-800 mb-1">{policy.name}</p>
                  <p className="text-xs text-gray-500">{policy.rules}</p>
                </div>
                <StatusBadge status="protected">{policy.status}</StatusBadge>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
