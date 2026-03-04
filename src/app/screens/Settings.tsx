import { Smartphone, Bell, Shield, Lock, User, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Toggle } from '../components/Toggle';
import { useState } from 'react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('identity');
  
  // WebAuthn settings state
  const [webAuthnSettings, setWebAuthnSettings] = useState({
    biometric: true,
    hardwareKey: false,
    platformAuth: true,
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    dataAccessNotifications: true,
    auditLogAccess: true,
    crossDepartmentSharing: false,
    thirdPartyAccess: false,
    dataAnonymization: true,
  });
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    ipWhitelist: false,
    sessionTimeout: true,
    locationBased: false,
    deviceFingerprint: true,
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    securityAlerts: true,
    accessNotifications: true,
    policyChanges: true,
    systemUpdates: false,
    weeklyReports: true,
    riskWarnings: true,
  });
  
  // Notification channels state
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: true,
    push: false,
    inApp: true,
  });

  const tabs = [
    { id: 'identity', label: 'Identity Devices', icon: Smartphone },
    { id: 'privacy', label: 'Privacy Controls', icon: Lock },
    { id: 'security', label: 'Security Preferences', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];
  
  const toggleWebAuthn = (key: keyof typeof webAuthnSettings) => {
    setWebAuthnSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const togglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const toggleSecurity = (key: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const toggleChannel = (key: keyof typeof notificationChannels) => {
    setNotificationChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl mb-2 text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your security and privacy preferences</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard className="p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/80 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-white/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Identity Devices Tab */}
      {activeTab === 'identity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Registered Devices</h3>
            <div className="space-y-4">
              {[
                {
                  name: 'iPhone 14 Pro',
                  type: 'Mobile',
                  registered: '2025-12-15',
                  lastUsed: '2026-03-04',
                  status: 'active',
                },
                {
                  name: 'MacBook Pro',
                  type: 'Desktop',
                  registered: '2025-11-20',
                  lastUsed: '2026-03-03',
                  status: 'active',
                },
                {
                  name: 'YubiKey 5',
                  type: 'Hardware Key',
                  registered: '2025-10-10',
                  lastUsed: '2026-03-01',
                  status: 'active',
                },
              ].map((device, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="backdrop-blur-[24px] bg-white/60 rounded-xl p-3">
                      {device.type === 'Hardware Key' ? (
                        <Key className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 mb-1">{device.name}</p>
                      <p className="text-xs text-gray-500">
                        {device.type} • Registered: {device.registered}
                      </p>
                      <p className="text-xs text-gray-500">Last used: {device.lastUsed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="protected">Active</StatusBadge>
                    <button className="text-sm text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full backdrop-blur-[24px] bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              + Add New Device
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">WebAuthn Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Biometric Authentication', description: 'Use fingerprint or face recognition', enabled: webAuthnSettings.biometric, key: 'biometric' as const },
                { label: 'Hardware Key Required', description: 'Require physical security key', enabled: webAuthnSettings.hardwareKey, key: 'hardwareKey' as const },
                { label: 'Platform Authenticator', description: 'Use device built-in authenticator', enabled: webAuthnSettings.platformAuth, key: 'platformAuth' as const },
              ].map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30"
                >
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => toggleWebAuthn(setting.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Privacy Controls Tab */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Data Privacy Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Data Access Notifications', description: 'Alert me when data is accessed', enabled: privacySettings.dataAccessNotifications, key: 'dataAccessNotifications' as const },
                { label: 'Audit Log Access', description: 'Allow me to view full audit logs', enabled: privacySettings.auditLogAccess, key: 'auditLogAccess' as const },
                { label: 'Cross-Department Sharing', description: 'Allow data sharing between departments', enabled: privacySettings.crossDepartmentSharing, key: 'crossDepartmentSharing' as const },
                { label: 'Third-Party Access', description: 'Allow authorized third-party access', enabled: privacySettings.thirdPartyAccess, key: 'thirdPartyAccess' as const },
                { label: 'Data Anonymization', description: 'Anonymize data for analytics', enabled: privacySettings.dataAnonymization, key: 'dataAnonymization' as const },
              ].map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30"
                >
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => togglePrivacy(setting.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Data Rights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Request Data Export', description: 'Download all your data' },
                { label: 'Request Data Deletion', description: 'Delete specific data records' },
                { label: 'Access Reports', description: 'Download access logs' },
                { label: 'Update Information', description: 'Modify personal data' },
              ].map((action, index) => (
                <button
                  key={index}
                  className="p-4 rounded-xl bg-white/30 hover:bg-white/50 transition-all text-left"
                >
                  <p className="text-sm text-gray-800 mb-1">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Security Preferences Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Security Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', description: 'Require 2FA for all logins', enabled: securitySettings.twoFactor, key: 'twoFactor' as const },
                { label: 'IP Whitelisting', description: 'Only allow access from trusted IPs', enabled: securitySettings.ipWhitelist, key: 'ipWhitelist' as const },
                { label: 'Session Timeout', description: 'Auto logout after 15 minutes of inactivity', enabled: securitySettings.sessionTimeout, key: 'sessionTimeout' as const },
                { label: 'Location-Based Access', description: 'Restrict access by geographic location', enabled: securitySettings.locationBased, key: 'locationBased' as const },
                { label: 'Device Fingerprinting', description: 'Track and verify device signatures', enabled: securitySettings.deviceFingerprint, key: 'deviceFingerprint' as const },
              ].map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30"
                >
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => toggleSecurity(setting.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Security Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Risk Score', value: '0.12', status: 'Low' },
                { label: 'Failed Logins', value: '0', status: 'None' },
                { label: 'Security Score', value: '95/100', status: 'Excellent' },
              ].map((stat, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/30 text-center">
                  <div className="text-2xl mb-2 text-gray-800">{stat.value}</div>
                  <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                  <StatusBadge status="protected">{stat.status}</StatusBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Security Alerts', description: 'Critical security events and threats', enabled: notificationSettings.securityAlerts, key: 'securityAlerts' as const },
                { label: 'Access Notifications', description: 'When someone accesses your data', enabled: notificationSettings.accessNotifications, key: 'accessNotifications' as const },
                { label: 'Policy Changes', description: 'Updates to governance policies', enabled: notificationSettings.policyChanges, key: 'policyChanges' as const },
                { label: 'System Updates', description: 'Platform maintenance and updates', enabled: notificationSettings.systemUpdates, key: 'systemUpdates' as const },
                { label: 'Weekly Reports', description: 'Weekly security and access summary', enabled: notificationSettings.weeklyReports, key: 'weeklyReports' as const },
                { label: 'Risk Warnings', description: 'Elevated risk score alerts', enabled: notificationSettings.riskWarnings, key: 'riskWarnings' as const },
              ].map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30"
                >
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => toggleNotification(setting.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 text-gray-800">Notification Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { channel: 'Email', address: 'user@example.gov', enabled: notificationChannels.email, key: 'email' as const },
                { channel: 'SMS', address: '+1 (555) 123-4567', enabled: notificationChannels.sms, key: 'sms' as const },
                { channel: 'Push Notifications', address: 'Mobile App', enabled: notificationChannels.push, key: 'push' as const },
                { channel: 'In-App', address: 'Dashboard Alerts', enabled: notificationChannels.inApp, key: 'inApp' as const },
              ].map((channel, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/30"
                >
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{channel.channel}</p>
                    <p className="text-xs text-gray-500">{channel.address}</p>
                  </div>
                  <Toggle
                    enabled={channel.enabled}
                    onToggle={() => toggleChannel(channel.key)}
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}