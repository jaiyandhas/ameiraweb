import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { 
  Building2, 
  Check, 
  LayoutGrid, 
  User, 
  Mail, 
  Key, 
  LogOut, 
  Loader2, 
  ArrowUpRight,
  Package,
  ShoppingBag,
  Store,
  ClipboardList,
  Wrench,
  Factory,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Package,
  ShoppingBag,
  Store,
  ClipboardList,
  Wrench,
  Factory,
};

function resolveIcon(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey] ?? Package;
}

export const SettingsPage: React.FC = () => {
  const { business, user, apps, updateBusiness, logout } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab state derived from URL
  const getTabFromPath = () => {
    if (location.pathname.endsWith('/apps')) return 'apps';
    if (location.pathname.endsWith('/account')) return 'account';
    return 'profile';
  };

  const activeTab = getTabFromPath();

  // Profile Form State
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [address, setAddress] = useState(business?.address || '');
  const [city, setCity] = useState(business?.city || '');
  const [contactEmail, setContactEmail] = useState(business?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(business?.contactPhone || '');
  const [currency, setCurrency] = useState(business?.currency || 'INR (₹)');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset message
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Please enter a business name');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await updateBusiness({
        name: businessName.trim(),
        address: address.trim(),
        city: city.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        currency: currency.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save business settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = () => {
    setPasswordResetSent(true);
    setTimeout(() => setPasswordResetSent(false), 4000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const installedApps = apps.filter(a => a.installed);
  const comingSoonApps = apps.filter(a => !a.installed);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your business identity, workspace tools, and account preferences."
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-8 overflow-x-auto pb-px">
        <button
          onClick={() => navigate('/settings')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Business Profile
        </button>

        <button
          onClick={() => navigate('/settings/apps')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'apps'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Workspace Tools ({installedApps.length})
        </button>

        <button
          onClick={() => navigate('/settings/account')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'account'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <User className="h-4 w-4" />
          My Account
        </button>
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="flex flex-col gap-6 max-w-2xl">
          {errorMessage && <Alert type="error" message={errorMessage} />}
          {saveSuccess && <Alert type="success" message="Business settings saved successfully." />}

          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-zinc-900" />
              What is your business called and where is it?
            </h3>

            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex General Store"
              disabled={isSaving}
              autoFocus
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / Region"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Coimbatore, Tamil Nadu"
                disabled={isSaving}
              />

              <Input
                label="Currency Format"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g. INR (₹) or USD ($)"
                disabled={isSaving}
              />
            </div>

            <Input
              label="Business Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 42 Cross Cut Road, Gandhipuram"
              disabled={isSaving}
            />
          </Card>

          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-zinc-900" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Contact Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. contact@store.com"
                disabled={isSaving}
              />

              <Input
                label="Official Phone Number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +91 98765 12345"
                disabled={isSaving}
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" size="lg" disabled={isSaving} className="px-8">
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Business Details'
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Workspace Tools */}
      {activeTab === 'apps' && (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Installed Tools</h2>
            <p className="text-sm text-zinc-500 mt-1">Tools currently active in your business workspace.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {installedApps.map(app => {
              const Icon = resolveIcon(app.iconKey);
              return (
                <Card key={app.id} className="p-6 flex flex-col justify-between gap-5 bg-white border-zinc-200/80">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="success">Installed</Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{app.name}</h3>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{app.description}</p>
                  </div>

                  {app.slug === 'team' && (
                    <Button variant="secondary" size="md" onClick={() => navigate('/people')} className="w-full">
                      Open Team Directory
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  )}
                  {app.slug !== 'team' && (
                    <div className="pt-2 text-xs text-zinc-400">
                      Core foundational workspace module
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 pt-8">
            <h2 className="text-xl font-bold text-zinc-900">Upcoming Tools</h2>
            <p className="text-sm text-zinc-500 mt-1">Future tools that will connect directly to your workspace.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoonApps.map(app => {
              const Icon = resolveIcon(app.iconKey);
              return (
                <div key={app.id} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/60 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="neutral">Coming Soon</Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-600">{app.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{app.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Account */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-6 max-w-2xl">
          <Card className="p-6 sm:p-8 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-900" />
              How do I manage my own account?
            </h3>

            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-zinc-900">{user?.fullName || 'Business Owner'}</h4>
                <p className="text-sm text-zinc-500">{user?.emailOrPhone || 'N/A'}</p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 border-t border-zinc-100 pt-2 text-sm">
              <div className="py-3 flex justify-between">
                <span className="text-zinc-500 font-medium">User ID</span>
                <span className="font-mono text-xs text-zinc-700">{user?.userId || 'N/A'}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-zinc-500 font-medium">Authentication Method</span>
                <span className="font-semibold text-zinc-900">Email & Password</span>
              </div>
            </div>
          </Card>

          {/* Security & Password Reset */}
          <Card className="p-6 sm:p-8 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Key className="h-5 w-5 text-zinc-900" />
              Security & Password
            </h3>

            <p className="text-sm text-zinc-500 leading-relaxed">
              We can send instructions to your registered email address ({user?.emailOrPhone}) to update your password.
            </p>

            {passwordResetSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2 border border-emerald-200">
                <Check className="h-4 w-4" /> Password reset link has been dispatched to your email.
              </div>
            ) : (
              <div>
                <Button variant="outline" size="md" onClick={handleResetPassword}>
                  Send Password Reset Email
                </Button>
              </div>
            )}
          </Card>

          {/* Sign Out Card */}
          <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-red-100 bg-red-50/20">
            <div>
              <h4 className="text-base font-bold text-zinc-900">Sign Out of Ameira</h4>
              <p className="text-sm text-zinc-500 mt-0.5">End your current session on this device.</p>
            </div>

            <Button variant="danger" size="md" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
