import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-[#CFE8FF] to-[#E9E3FF] flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl opacity-40 animate-pulse" />
            <div className="relative backdrop-blur-[24px] bg-white/45 border border-white/60 rounded-full p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
              <Shield className="w-20 h-20 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-4xl mb-2 font-semibold text-gray-800">
            Secure Governance Platform
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Transparent Service Delivery
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-blue-600"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Initializing secure systems...</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
