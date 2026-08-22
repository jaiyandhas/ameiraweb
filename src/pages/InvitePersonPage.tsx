import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Check, Copy, Loader2, ArrowRight } from 'lucide-react';

interface InvitePersonPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const InvitePersonPage: React.FC<InvitePersonPageProps> = ({
  onBack,
  onSuccess
}) => {
  const { roles, invitePerson, business } = useWorkspace();
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    roles.find(r => r.name === 'Staff')?.id || roles[0]?.id || 'role-staff'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; emailOrPhone?: string }>({});

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; emailOrPhone?: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Please enter their full name';
    if (!emailOrPhone.trim()) newErrors.emailOrPhone = 'Please enter their email address or phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await invitePerson(fullName.trim(), emailOrPhone.trim(), selectedRoleId);
      onSuccess();
    } catch (err) {
      console.error('Invite failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/join?biz=${business?.id || 'demo'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Invite a Person"
        subtitle="Add a team member to your business and choose their access level."
        onBack={onBack}
      />

      <form onSubmit={handleSendInvite} className="flex flex-col gap-8">
        {/* Step 1: Personal Details */}
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">1</span>
            Who are you adding?
          </h3>

          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
            }}
            error={errors.fullName}
            disabled={isSubmitting}
            autoFocus
          />

          <Input
            label="Email Address or Phone Number"
            placeholder="e.g. ramesh@business.com or +91 98765 43210"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              if (errors.emailOrPhone) setErrors(prev => ({ ...prev, emailOrPhone: undefined }));
            }}
            error={errors.emailOrPhone}
            helperText="We will associate their account with this contact info."
            disabled={isSubmitting}
          />
        </Card>

        {/* Step 2: Choose Access Level */}
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              What can they do? (Access Level)
            </h3>
            <p className="text-sm text-zinc-500 mt-2">
              Select the access level that best matches this person's role in your business.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => !isSubmitting && setSelectedRoleId(role.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900 ring-offset-2'
                      : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                        {role.name}
                      </h4>
                      {role.isPreset && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          Standard
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {role.description}
                    </p>
                  </div>

                  <div className={`mt-1 h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white border-white text-zinc-900' : 'border-zinc-300 text-transparent'
                  }`}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions & Secondary Copy Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            onClick={handleCopyLink} 
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            <Copy className="h-4 w-4" />
            {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Invite Link'}
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              size="lg" 
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Invitation
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
