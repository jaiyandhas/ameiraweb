import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building2, ShieldCheck, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { business, user, updateBusiness } = useWorkspace();
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim()) {
      updateBusiness(businessName.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Business Profile & Settings"
        subtitle="Manage your primary business identity and owner details."
      />

      <div className="flex flex-col gap-6">
        <form onSubmit={handleSave}>
          <Card className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-zinc-900" />
              General Business Details
            </h3>

            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Hardware"
            />

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <Check className="h-4 w-4" /> Saved Successfully!
                </span>
              ) : <span />}

              <Button type="submit" size="md">
                Save Settings
              </Button>
            </div>
          </Card>
        </form>

        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zinc-900" />
            Workspace Owner Info
          </h3>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Owner Name</span>
              <span className="font-semibold text-zinc-900">{user?.fullName || 'Business Owner'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Contact</span>
              <span className="font-semibold text-zinc-900">{user?.emailOrPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Created Date</span>
              <span className="font-semibold text-zinc-900">{business?.createdAt || '2026-07-28'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
