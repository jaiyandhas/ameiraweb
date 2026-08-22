import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LayoutDashboard, LayoutGrid, Users, Shield, Settings, LogOut, Building2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

type WorkspaceTab = 'dashboard' | 'apps' | 'people' | 'roles' | 'settings';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ children }) => {
  const { business, user, logout } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): WorkspaceTab => {
    const path = location.pathname;
    if (path.startsWith('/workspace')) return 'apps';
    if (path.startsWith('/people')) return 'people';
    if (path.startsWith('/roles')) return 'roles';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentTab = getActiveTab();

  const handleNavClick = (tab: WorkspaceTab) => {
    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'apps':
        navigate('/workspace');
        break;
      case 'people':
        navigate('/people');
        break;
      case 'roles':
        navigate('/roles');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Home', icon: LayoutDashboard },
    { id: 'apps' as const, label: 'Workspace', icon: LayoutGrid },
    { id: 'people' as const, label: 'Team', icon: Users },
    { id: 'roles' as const, label: 'Roles & Access', icon: Shield },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-zinc-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/ameiralogo.png" alt="Ameira" className="h-9 w-auto object-contain" />
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 hidden sm:inline">
              Ameira
            </span>
          </div>

          <div className="h-5 w-px bg-zinc-200 mx-1 hidden sm:block" />

          {business && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-100/80 border border-zinc-200/60">
              <Building2 className="h-4 w-4 text-zinc-500" />
              <span className="font-semibold text-sm text-zinc-900">{business.name}</span>
              <Badge variant="default" size="sm">Owner</Badge>
            </div>
          )}
        </div>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-zinc-900">{user.fullName}</p>
                <p className="text-xs text-zinc-500">{user.emailOrPhone}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="sticky top-24 bg-white border border-zinc-200/80 rounded-2xl p-3 shadow-sm">
            <nav className="flex flex-col gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Nav Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-2 flex justify-around z-40">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium ${
                  isActive ? 'text-zinc-900 font-bold' : 'text-zinc-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Canvas Area */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
};
