import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithContact, pendingContact } = useWorkspace();
  const [contact, setContact] = useState(pendingContact || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    setError('');
    loginWithContact(contact.trim());
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/ameiralogo.png" alt="Ameira Logo" className="h-14 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Welcome to Ameira
          </h1>
          <p className="text-base text-zinc-500 mt-2">
            Enter your email or phone number to sign in or create your business workspace.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Email or Phone Number"
              placeholder="e.g. ramesh@store.com or +91 98765 43210"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (error) setError('');
              }}
              error={error}
              autoFocus
            />

            <Button type="submit" size="lg" fullWidth>
              Continue
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>

        <p className="text-xs text-center text-zinc-400 mt-6">
          We will send a 6-digit confirmation code. No passwords to remember.
        </p>
      </div>
    </div>
  );
};
