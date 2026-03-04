import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Shield, Activity, Eye, FileCheck, Settings, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/app', label: 'Dashboard', icon: Shield },
    { path: '/app/security', label: 'Security Monitoring', icon: Activity },
    { path: '/app/transparency', label: 'Transparency', icon: Eye },
    { path: '/app/policy', label: 'Policy Control', icon: FileCheck },
    { path: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-[#CFE8FF] to-[#E9E3FF]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full backdrop-blur-[24px] bg-white/45 border-r border-white/60 transition-all duration-300 z-50 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="p-6 flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/assets/logo_ssd_v2.png" alt="SSD Logo" className="w-full h-full object-cover" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-sm font-bold leading-tight text-gray-800">SECURE SERVICE</h1>
                <p className="text-[10px] tracking-widest text-gray-500 uppercase">Delivery Platform</p>
              </div>
            )}
            {!sidebarOpen && <div className="flex-1" />}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/30 transition-colors ml-auto"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-white/60 text-blue-600 shadow-sm'
                    : 'hover:bg-white/30 text-gray-700'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button at bottom of sidebar */}
        <div className="p-4 border-t border-white/40">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50/50 hover:text-red-600 ${!sidebarOpen ? 'justify-center' : ''
              }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'
          } p-8`}
      >
        <Outlet />
      </main>
    </div>
  );
}
