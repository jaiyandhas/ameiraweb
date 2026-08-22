import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Alert } from '../ui/Alert';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RegisterFormProps {
  onSuccess: (fullName: string, contact: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [errors, setErrors] = useState<{ 
    fullName?: string; 
    contact?: string; 
    password?: string; 
    confirmPassword?: string;
    agreedTerms?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setSuccessInfo('');
    const newErrors: typeof errors = {};

    if (!fullName.trim()) newErrors.fullName = 'Please enter your full name';
    if (!contact.trim()) newErrors.contact = 'Please enter your email address';
    if (!password) newErrors.password = 'Please create a password';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreedTerms) newErrors.agreedTerms = 'You must agree to terms to register';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: contact.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('security purposes') || error.status === 429) {
          setGlobalError('Rate limit: Supabase security prevents rapid repeat sign-ups. If you already registered, please sign in below.');
        } else {
          setGlobalError(error.message || 'Failed to create account. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (data.session) {
          onSuccess(fullName.trim(), contact.trim());
        } else {
          // Attempt instant sign in
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: contact.trim(),
            password: password,
          });

          if (signInData?.session) {
            onSuccess(fullName.trim(), contact.trim());
          } else {
            setSuccessInfo('Account created! Please check your email to confirm your account, or sign in.');
          }
        }
      }
    } catch (err: any) {
      setGlobalError(err?.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {globalError && <Alert type="error" message={globalError} />}
      
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Registration Received</span>
          </div>
          <p className="text-xs leading-relaxed text-emerald-800">{successInfo}</p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="mt-2 text-xs font-bold text-emerald-900 underline hover:text-emerald-950 text-left"
          >
            Click here to Sign In &rarr;
          </button>
        </div>
      )}

      <Input
        label="Your Full Name"
        placeholder="e.g. Ramesh Patel"
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
          if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
        }}
        error={errors.fullName}
        disabled={isLoading}
        autoFocus
      />

      <Input
        label="Email Address"
        placeholder="e.g. ramesh@store.com"
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
          if (errors.contact) setErrors(prev => ({ ...prev, contact: undefined }));
        }}
        error={errors.contact}
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          label="Create Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[42px] text-zinc-400 hover:text-zinc-700 transition-colors"
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      <Checkbox
        label="I agree to Ameira Terms of Service & Privacy Policy"
        checked={agreedTerms}
        onChange={(e) => {
          setAgreedTerms(e.target.checked);
          if (errors.agreedTerms) setErrors(prev => ({ ...prev, agreedTerms: undefined }));
        }}
        error={errors.agreedTerms}
        disabled={isLoading}
      />

      <Button type="submit" size="lg" fullWidth disabled={isLoading} className="mt-2">
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Start Your Workspace
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>

      <div className="pt-4 border-t border-zinc-100 text-center">
        <p className="text-sm text-zinc-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-zinc-900 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};
