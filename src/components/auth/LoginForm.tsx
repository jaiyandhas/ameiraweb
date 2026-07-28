import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Alert } from '../ui/Alert';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (emailOrPhone: string) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgot
}) => {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ contact?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    const errors: { contact?: string; password?: string } = {};

    if (!contact.trim()) {
      errors.contact = 'Please enter your email address or phone number';
    }
    if (!password) {
      errors.password = 'Please enter your password';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    // Simulate authentication API request
    setTimeout(() => {
      setIsLoading(false);
      // Demo validation check
      if (password.length < 4) {
        setGlobalError('Invalid contact credentials or password. Please try again.');
        return;
      }
      onSuccess(contact.trim());
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {globalError && <Alert type="error" message={globalError} />}

      <Input
        label="Email Address or Mobile Number"
        placeholder="e.g. ramesh@store.com or +91 98765 43210"
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
          if (fieldErrors.contact) setFieldErrors(prev => ({ ...prev, contact: undefined }));
        }}
        error={fieldErrors.contact}
        disabled={isLoading}
        autoFocus
      />

      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            error={fieldErrors.password}
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
      </div>

      <div className="flex items-center justify-between pt-1">
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={onSwitchToForgot}
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 hover:underline transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" size="lg" fullWidth disabled={isLoading} className="mt-2">
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            Sign In to Workspace
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>

      <div className="pt-4 border-t border-zinc-100 text-center">
        <p className="text-sm text-zinc-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-zinc-900 hover:underline"
          >
            Register your business
          </button>
        </p>
      </div>
    </form>
  );
};
