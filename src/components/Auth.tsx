import React, { useState } from 'react';
import { supabase } from '../App';
import './Auth.css';

interface ValidationErrors {
  email?: string;
  password?: string;
  fullName?: string;
}

const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Full name validation
  const validateFullName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  };

  // Real-time validation - only show feedback, don't prevent submission
  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear any previous validation errors when user starts typing
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    // Clear any previous validation errors when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    // Clear any previous validation errors when user starts typing
    if (validationErrors.fullName) {
      setValidationErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  // Form validation before submission
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation - different for signup vs login
    if (!password) {
      errors.password = 'Password is required';
    } else if (isSignUp) {
      // Only validate password strength for signup
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.password = `Password must include: ${passwordValidation.errors.join(', ')}`;
      }
    }
    // For login, we don't validate password strength

    // Full name validation (only for sign up)
    if (isSignUp) {
      if (!fullName) {
        errors.fullName = 'Full name is required';
      } else if (!validateFullName(fullName)) {
        errors.fullName = 'Full name must be at least 2 characters and contain only letters and spaces';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Validate form on submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            }
          }
        });
        
        if (error) {
          console.error('Supabase signup error:', error);
          
          // Handle specific Supabase auth errors
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (error.message.includes('Invalid email') || error.message.includes('invalid')) {
            setError(`Email validation failed. Please check your email address and try again. If the problem persists, this might be a configuration issue.`);
          } else if (error.message.includes('Password')) {
            setError('Password does not meet security requirements.');
          } else if (error.message.includes('SMTP') || error.message.includes('email')) {
            setError('There was an issue sending the verification email. Please check your email configuration or try again later.');
          } else {
            setError(`Signup failed: ${error.message}`);
          }
          return;
        }
        
        // Show success message instead of alert
        setSuccessMessage(`Account created successfully! We've sent a verification email to ${email}. Please check your inbox and click the verification link to activate your account.`);
        
        // Clear the form
        setEmail('');
        setPassword('');
        setFullName('');
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        
        if (error) {
          // Handle specific sign-in errors
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Too many requests')) {
            setError('Too many sign-in attempts. Please wait a few minutes before trying again.');
          } else {
            setError(error.message);
          }
          return;
        }
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (): string => {
    // Only show password strength for signup
    if (!password || !isSignUp) return '';
    const validation = validatePassword(password);
    const score = 5 - validation.errors.length;
    
    if (score <= 1) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>LinkShare</h1>
        <p className="auth-subtitle">
          {isSignUp ? 'Create your account to start saving links' : 'Save and share links with your friends'}
        </p>
        
        {successMessage && (
          <div className="auth-success">
            <div className="success-icon">✉️</div>
            <div className="success-content">
              <h3>Check Your Email</h3>
              <p>{successMessage}</p>
              <p className="success-note">
                After verifying your email, you can return here to sign in.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleAuth} className="auth-form" noValidate>
          {isSignUp && (
            <div className="form-field">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => handleFullNameChange(e.target.value)}
                required
                className={`auth-input ${validationErrors.fullName ? 'error' : ''}`}
                autoComplete="name"
              />
              {validationErrors.fullName && (
                <span className="validation-error">{validationErrors.fullName}</span>
              )}
            </div>
          )}
          
          <div className="form-field">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              className={`auth-input ${validationErrors.email ? 'error' : ''}`}
              autoComplete="email"
            />
            {validationErrors.email && (
              <span className="validation-error">{validationErrors.email}</span>
            )}
          </div>
          
          <div className="form-field">
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className={`auth-input ${validationErrors.password ? 'error' : ''}`}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {password && isSignUp && (
              <div className={`password-strength ${getPasswordStrength()}`}>
                <div className="strength-indicator">
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                </div>
                <span className="strength-text">
                  {getPasswordStrength() === 'weak' && 'Weak password'}
                  {getPasswordStrength() === 'medium' && 'Medium password'}
                  {getPasswordStrength() === 'strong' && 'Strong password'}
                </span>
              </div>
            )}
            
            {validationErrors.password && (
              <span className="validation-error">{validationErrors.password}</span>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <p className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMessage(null);
              setValidationErrors({});
            }}
            className="auth-toggle-button"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth; 