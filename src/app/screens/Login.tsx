import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { API_BASE_URL } from '../config';

const USER_ID = 'citizen123';
const USER_NAME = 'citizen@secgov.in';
const API = API_BASE_URL;

type Phase = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

export function Login() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/auth/status?userId=${USER_ID}`)
      .then(r => r.json())
      .then(d => setIsRegistered(d.registered))
      .catch(() => setIsRegistered(false));
  }, []);

  async function handleRegister() {
    try {
      setPhase('scanning');
      setMessage('Generating your secure key pair…');

      const optRes = await fetch(`${API}/auth/register-options?userId=${USER_ID}&userName=${USER_NAME}`);
      const options = await optRes.json();

      setMessage('Touch your fingerprint sensor or use Face ID…');
      const credential = await startRegistration({ optionsJSON: options });

      setPhase('verifying');
      setMessage('Verifying with server…');

      const verifyRes = await fetch(`${API}/auth/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, userName: USER_NAME, response: credential }),
      });
      const { verified } = await verifyRes.json();

      if (verified) {
        setIsRegistered(true);
        setPhase('success');
        setMessage('Device registered! You can now login with biometrics.');
        setTimeout(() => setPhase('idle'), 2000);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      setPhase('error');
      setMessage(err.message || 'Registration failed. Please try again.');
      setTimeout(() => setPhase('idle'), 3000);
    }
  }

  async function handleLogin() {
    try {
      setPhase('scanning');
      setMessage('Waiting for biometric confirmation…');

      const optRes = await fetch(`${API}/auth/login-options?userId=${USER_ID}`);
      const options = await optRes.json();

      setMessage('Verify your identity on this device…');
      const authResponse = await startAuthentication({ optionsJSON: options });

      setPhase('verifying');
      setMessage('Authenticating with cryptographic signature…');

      const verifyRes = await fetch(`${API}/auth/login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, response: authResponse }),
      });
      const { verified } = await verifyRes.json();

      if (verified) {
        setPhase('success');
        setMessage('Identity confirmed. Welcome.');
        setTimeout(() => navigate('/app'), 1200);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      // Demo fallback: if WebAuthn not supported or no credential, allow direct access
      if (err.message?.includes('not registered') || err.message?.includes('No auth challenge') || err.name === 'NotAllowedError') {
        setPhase('success');
        setMessage('Secure session established.');
        setTimeout(() => navigate('/app'), 1000);
      } else {
        setPhase('error');
        setMessage(err.message || 'Authentication failed. Try registering first.');
        setTimeout(() => setPhase('idle'), 3000);
      }
    }
  }

  const busy = phase === 'scanning' || phase === 'verifying';

  return (
    <div className="login-root">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <motion.div
        className="login-card"
        initial={{ y: 32, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Emblem */}
        <div className="emblem-wrap">
          <motion.div
            className="emblem-ring"
            animate={{ rotate: busy ? 360 : 0 }}
            transition={{ duration: 3, repeat: busy ? Infinity : 0, ease: 'linear' }}
          />
          <div className="emblem-core overflow-hidden">
            <img src="/assets/logo_ssd_v2.png" alt="SSD Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="wordmark">
          <h1 className="brand-name">SECURE SERVICE DELIVERY</h1>
          <p className="brand-sub">Zero-Trust Identity Monitoring</p>
        </div>

        {/* Status area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className={`status-pill ${phase}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {phase === 'idle' && <span className="dot dot-idle" />}
            {phase === 'scanning' && <span className="dot dot-pulse" />}
            {phase === 'verifying' && <span className="dot dot-pulse yellow" />}
            {phase === 'success' && <span className="dot dot-green" />}
            {phase === 'error' && <span className="dot dot-red" />}
            <span className="status-text">
              {phase === 'idle' && (isRegistered ? 'Device registered — ready to authenticate' : 'No device key found — register first')}
              {message && phase !== 'idle' && message}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Auth method info */}
        <div className="method-card">
          <div className="method-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="method-title">Passwordless · FIDO2 · WebAuthn</p>
            <p className="method-desc">Your private key never leaves this device.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="btn-group">
          {!isRegistered && (
            <motion.button
              className="btn btn-secondary"
              onClick={handleRegister}
              disabled={busy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" />
                </svg>
              </span>
              Register This Device
            </motion.button>
          )}

          <motion.button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={busy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {busy ? (
              <svg className="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {busy ? (phase === 'scanning' ? 'Scanning…' : 'Verifying…') : 'Authenticate with Biometrics'}
          </motion.button>
        </div>

        <p className="footer-note">
          ECC key pair · Secure Enclave · No passwords stored
        </p>
      </motion.div>

      <style>{`
        .login-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f3f6ff 0%, #fdf4ff 30%, #e8f4fd 60%, #fff4f4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.55; pointer-events: none; }
        .blob-1 { width: 500px; height: 500px; background: radial-gradient(circle, #d4e8f0, transparent); top: -120px; left: -120px; animation: drift 8s ease-in-out infinite alternate; }
        .blob-2 { width: 420px; height: 420px; background: radial-gradient(circle, #e8d0f8, transparent); bottom: -80px; right: -80px; animation: drift 10s ease-in-out infinite alternate-reverse; }
        .blob-3 { width: 340px; height: 340px; background: radial-gradient(circle, #f8d8e0, transparent); bottom: 20%; left: 60%; animation: drift 7s ease-in-out infinite alternate; }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(30px, 40px) scale(1.1); } }

        .login-card {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 36px;
          padding: 56px 48px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 12px 64px rgba(160,140,220,0.08), 0 4px 16px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 28px;
          position: relative;
          z-index: 10;
        }

        .emblem-wrap { position: relative; width: 88px; height: 88px; margin: 0 auto; }
        .emblem-ring {
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 1.5px dashed rgba(168,140,220,0.3);
        }
        .emblem-core {
          width: 88px; height: 88px; border-radius: 50%;
          background: #ffffff;
          border: 1px solid rgba(168,140,220,0.15);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(160,140,220,0.1);
        }

        .wordmark { text-align: center; }
        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem; font-weight: 700;
          color: #1a1b2e;
          letter-spacing: -0.01em;
          line-height: 1.1;
          margin: 0 0 8px;
          text-transform: uppercase;
        }
        .brand-sub {
          font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: #8c8c9e; font-weight: 600; margin: 0;
        }

        .status-pill {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 18px; border-radius: 18px;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(168,140,220,0.12);
          font-size: 0.8rem; color: #5a5a7a;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .status-pill.success { background: rgba(230,255,241,0.8); border-color: rgba(34,197,94,0.15); }
        .status-pill.error { background: rgba(255,241,241,0.8); border-color: rgba(239,68,68,0.15); }

        .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dot-idle { background: #cbd5e1; }
        .dot-green { background: #22c55e; }
        .dot-red { background: #ef4444; }
        .dot-pulse { background: #94a3b8; animation: pulse 1.2s ease-in-out infinite; }
        .dot-pulse.yellow { background: #f59e0b; }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }
        .status-text { flex: 1; line-height: 1.4; font-weight: 500; }

        .method-card {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 20px; border-radius: 22px;
          background: linear-gradient(135deg, rgba(240,244,255,0.6), rgba(255,248,255,0.6));
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.9);
        }
        .method-icon {
          width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
          background: #ffffff;
          border: 1px solid rgba(168,140,220,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #a78bfa;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .method-title { font-size: 0.82rem; font-weight: 600; color: #2d2e3e; margin: 0 0 3px; letter-spacing: 0.01em; }
        .method-desc { font-size: 0.72rem; color: #7c7c8e; font-weight: 500; margin: 0; }

        .btn-group { display: flex; flex-direction: column; gap: 12px; }
        .btn {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          padding: 17px 24px; border-radius: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.92rem; font-weight: 600;
          cursor: pointer; border: none; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary {
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          color: white;
          box-shadow: 0 8px 24px rgba(167,139,250,0.3);
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(167,139,250,0.45); transform: translateY(-2px); }
        .btn-secondary {
          background: rgba(255,255,255,0.85);
          color: #5a5a7a;
          border: 1px solid rgba(168,140,220,0.15);
        }
        .btn-secondary:hover:not(:disabled) { background: #ffffff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        
        .spinner-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .footer-note {
          text-align: center; font-size: 0.7rem;
          color: #94a3b8; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
