import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Loader2, ArrowLeft, Send } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin
}) => {
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError('Please enter your registered email or mobile number');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate sending password reset instructions
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <Alert
          type="success"
          message={`Password reset instructions have been sent to ${contact}. Please check your inbox or SMS.`}
        />

        <Button variant="outline" size="lg" fullWidth onClick={onBackToLogin}>
          <ArrowLeft className="h-4 w-4" />
          Return to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        label="Registered Email or Mobile Number"
        placeholder="e.g. ramesh@store.com or +91 98765 43210"
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
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
            Sending Instructions...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Password Reset Link
          </>
        )}
      </Button>

      <div className="pt-4 border-t border-zinc-100 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>
      </div>
    </form>
  );
};
