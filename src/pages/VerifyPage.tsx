import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { pendingContact, verifyOtp, loginWithContact } = useWorkspace();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    const success = verifyOtp(code);
    if (!success) {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <button
          onClick={() => loginWithContact(pendingContact)}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Change contact details
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Check your contact
          </h1>
          <p className="text-base text-zinc-500 mt-2">
            We sent a 6-digit confirmation code to <span className="font-semibold text-zinc-900">{pendingContact || 'your email/phone'}</span>.
          </p>
        </div>

        <div className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-sm">
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-zinc-900">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  if (error) setError('');
                }}
                className="w-full text-center text-3xl font-mono tracking-[0.5em] px-4 py-4 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                autoFocus
              />
              {error && <p className="text-sm font-medium text-red-600 mt-1">{error}</p>}
            </div>

            <Button type="submit" size="lg" fullWidth>
              Confirm Code
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => verifyOtp('123456')}
              className="text-sm text-zinc-500 hover:text-zinc-900 underline"
            >
              Demo shortcut: Enter 123456 to continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
