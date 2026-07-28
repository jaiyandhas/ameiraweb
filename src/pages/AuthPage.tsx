import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onBackToLanding
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const { loginWithContact } = useWorkspace();

  const handleLoginSuccess = (contact: string) => {
    loginWithContact(contact);
  };

  const handleRegisterSuccess = (_fullName: string, contact: string) => {
    loginWithContact(contact);
  };

  const getTitles = () => {
    switch (mode) {
      case 'register':
        return {
          title: 'Start your workspace',
          subtitle: 'Create a free account for your store, factory or wholesale business.'
        };
      case 'forgot':
        return {
          title: 'Reset your password',
          subtitle: 'Enter your registered email or phone number and we\'ll send reset instructions.'
        };
      case 'login':
      default:
        return {
          title: 'Welcome back',
          subtitle: 'Sign in to your Ameira workspace.'
        };
    }
  };

  const { title, subtitle } = getTitles();

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      onBackToLanding={onBackToLanding}
    >
      {mode === 'login' && (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setMode('register')}
          onSwitchToForgot={() => setMode('forgot')}
        />
      )}

      {mode === 'register' && (
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      )}

      {mode === 'forgot' && (
        <ForgotPasswordForm
          onBackToLogin={() => setMode('login')}
        />
      )}
    </AuthLayout>
  );
};
