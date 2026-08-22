import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export const CreateBusinessPage: React.FC = () => {
  const { createBusiness } = useWorkspace();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createBusiness(businessName.trim());
      if (result && result.success) {
        navigate('/dashboard', { replace: true });
      } else if (result && result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create business workspace. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white mb-4 shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Create Your Business
          </h1>
          <p className="text-base text-zinc-500 mt-2">
            What is the name of your business or store? You can change this anytime.
          </p>
        </div>

        <div className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <Alert type="error" message={error} />}

            <Input
              label="Business Name"
              placeholder="e.g. Apex Hardware & General Store"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (error) setError('');
              }}
              error={error}
              disabled={isLoading}
              autoFocus
            />

            <Button type="submit" size="lg" fullWidth disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Business Workspace
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-xs text-center text-zinc-400 mt-6">
          Step 1 of 1 • Takes less than 10 seconds.
        </p>
      </div>
    </div>
  );
};
