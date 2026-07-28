import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Check, Copy } from 'lucide-react';

interface InvitePersonPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const InvitePersonPage: React.FC<InvitePersonPageProps> = ({
  onBack,
  onSuccess
}) => {
  const { roles, invitePerson } = useWorkspace();
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-staff');
  const [copiedLink, setCopiedLink] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; emailOrPhone?: string }>({});

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; emailOrPhone?: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Please enter their full name';
    if (!emailOrPhone.trim()) newErrors.emailOrPhone = 'Please enter their email or phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    invitePerson(fullName.trim(), emailOrPhone.trim(), selectedRoleId);
    onSuccess();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://ameira.app/join?biz=demo');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Invite a Person"
        subtitle="Add a new employee or manager to your business workspace."
        onBack={onBack}
      />

      <form onSubmit={handleSendInvite} className="flex flex-col gap-8">
        {/* Step 1: Personal Details */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            1. Member Details
          </h3>

          <Input
            label="Full Name"
            placeholder="e.g. Anand Kumar"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
            }}
            error={errors.fullName}
          />

          <Input
            label="Email Address or Phone Number"
            placeholder="e.g. anand@store.com or +91 98765 12345"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              if (errors.emailOrPhone) setErrors(prev => ({ ...prev, emailOrPhone: undefined }));
            }}
            error={errors.emailOrPhone}
            helperText="We will send an invitation code to this contact."
          />
        </Card>

        {/* Step 2: Select Role */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            2. Assign Job Role
          </h3>

          <div className="flex flex-col gap-3">
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                      : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <h4 className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                      {role.name}
                    </h4>
                    <p className={`text-sm mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {role.description}
                    </p>
                  </div>

                  <div className={`mt-0.5 h-6 w-6 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-white border-white text-zinc-900' : 'border-zinc-300 text-transparent'
                  }`}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Submit & Secondary Copy Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button type="button" variant="outline" size="lg" onClick={handleCopyLink} className="w-full sm:w-auto">
            <Copy className="h-5 w-5" />
            {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Invite Link'}
          </Button>

          <Button type="submit" size="lg" className="w-full sm:w-auto px-8">
            Send Invitation
          </Button>
        </div>
      </form>
    </div>
  );
};
