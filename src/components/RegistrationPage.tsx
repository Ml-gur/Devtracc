import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationPageProps {
  onNavigate: (page: 'login' | 'welcome') => void;
  onRegister: (userData: {
    fullName: string;
    email: string;
    password: string;
    country: string;
    phone: string;
  }) => Promise<{ 
    success: boolean; 
    error?: string; 
    requiresConfirmation?: boolean;
    message?: string;
  }>;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  phone: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  phone?: string;
  general?: string;
}

export default function RegistrationPage({ onNavigate, onRegister }: RegistrationPageProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    phone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  const countries = [
    { value: 'kenya', label: 'Kenya' },
    { value: 'tanzania', label: 'Tanzania' },
    { value: 'uganda', label: 'Uganda' },
    { value: 'rwanda', label: 'Rwanda' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'ghana', label: 'Ghana' },
    { value: 'south_africa', label: 'South Africa' },
    { value: 'ethiopia', label: 'Ethiopia' },
    { value: 'morocco', label: 'Morocco' },
    { value: 'egypt', label: 'Egypt' },
    { value: 'other', label: 'Other African Country' }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear general error and success message
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
    if (confirmationRequired) {
      setConfirmationRequired(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    setConfirmationRequired(false);
    
    try {
      console.log('🚀 Starting registration process for:', formData.email);
      const result = await signUp({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        phone: formData.phone
      });

      console.log('📝 Registration result:', { 
        success: result.success, 
        requiresConfirmation: result.requiresConfirmation,
        hasUser: !!result.user,
        error: result.error 
      });

      if (!result.success) {
        if (result.error) {
          // Handle specific error types
          if (result.error.includes('already registered') || result.error.includes('already exists')) {
            console.log('⚠️ User already exists, showing login suggestion');
            setErrors({ email: 'This email is already registered. Please try logging in instead.' });
          } else if (result.requiresConfirmation) {
            console.log('📧 Registration successful, email confirmation required');
            setConfirmationRequired(true);
            setSuccessMessage(result.message || 'Please check your email to confirm your account.');
          } else {
            console.log('❌ Registration failed:', result.error);
            setErrors({ general: result.error });
          }
        } else {
          console.log('❌ Registration failed with unknown error');
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      } else {
        if (result.requiresConfirmation) {
          console.log('📧 Registration successful, email confirmation required');
          setConfirmationRequired(true);
          setSuccessMessage(result.message || 'Account created! Please check your email to confirm your account.');
          // The parent component will handle navigation to email confirmation
        } else {
          console.log('✅ Registration successful, email already confirmed');
          setSuccessMessage('Account created successfully! Setting up your profile...');
          // Navigation will be handled by the parent component
        }
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setErrors({ general: 'Registration failed. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => onNavigate('welcome')}
        className="absolute top-4 left-4 flex items-center gap-2"
        disabled={isLoading}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">DT</span>
            </div>
            <span className="text-xl font-bold">DevTrack</span>
          </div>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Join the African developer community and start showcasing your journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          {confirmationRequired ? (
            // Email confirmation success state
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Registration Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to{' '}
                  <span className="font-medium text-foreground">{formData.email}</span>
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <Mail className="h-4 w-4" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Please check your email and click the confirmation link to activate your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={() => onNavigate('login')}
                  className="w-full"
                >
                  Continue to Login
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  You'll be redirected to complete your profile after confirming your email.
                </p>
              </div>
            </div>
          ) : (
            // Registration form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {successMessage && !confirmationRequired && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => handleInputChange('country', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}