
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthTabs, TechOrbitDisplay, Ripple } from '../components/AnimatedAuthComponents';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: name.trim()
      });

      // Show success message
      setSuccess('Account created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Sign up error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please use a different email or try logging in.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/invalid-api-key':
          setError('Invalid API configuration. Please contact support.');
          break;
        default:
          setError(`Sign up failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSuccess('');
    setIsGoogleLoading(true);

    try {
      // Sign up with Google
      await signInWithPopup(auth, googleProvider);

      // Show success message
      setSuccess('Account created successfully with Google! Redirecting...');

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Google sign up error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      // Handle specific Google sign-in errors
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-up cancelled. Please try again.');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up blocked by browser. Please allow pop-ups and try again.');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email using a different sign-in method.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        case 'auth/unauthorized-domain':
          setError('This domain is not authorized for Google sign-in. Please contact support.');
          break;
        case 'auth/operation-not-allowed':
          setError('Google sign-in is not enabled for this app. Please contact support.');
          break;
        case 'auth/invalid-api-key':
          setError('Invalid API configuration. Please contact support.');
          break;
        default:
          setError(`Google sign-up failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const iconConfigs = [
    {
      duration: 20,
      delay: 0,
      radius: 80,
      path: true,
      reverse: false,
      component: () => <img src="/icons/notebook.png" alt="Notebook" className="w-8 h-8" />,
    },
    {
      duration: 25,
      delay: 5,
      radius: 140,
      path: true,
      reverse: true,
      component: () => <img src="/icons/latte-art.png" alt="Latte" className="w-10 h-10" />,
    },
    {
      duration: 30,
      delay: 10,
      radius: 200,
      path: true,
      reverse: false,
      component: () => <img src="/icons/hand.png" alt="Hand" className="w-12 h-12" />,
    },
    {
      duration: 22,
      delay: 2,
      radius: 110,
      path: false,
      reverse: true,
      component: () => <img src="/icons/doodle.png" alt="Doodle" className="w-8 h-8" />,
    },
    {
      duration: 28,
      delay: 8,
      radius: 170,
      path: false,
      reverse: false,
      component: () => <img src="/icons/friendship.png" alt="Friends" className="w-10 h-10" />,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Orbiting Icons Display (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-white">
        <Ripple />
        <TechOrbitDisplay iconsArray={iconConfigs} text="BookBriefs" />
      </div>

      {/* Right Side - Sign Up Form */}
      <AuthTabs
        formFields={{
          header: 'Create Account',
          subHeader: 'Join BookBriefs to start learning',
          fields: [
            {
              label: 'Full Name',
              required: true,
              type: 'text',
              placeholder: 'Enter your full name',
              onChange: (e) => setName(e.target.value),
            },
            {
              label: 'Email',
              required: true,
              type: 'email',
              placeholder: 'Enter your email',
              onChange: (e) => setEmail(e.target.value),
            },
            {
              label: 'Password',
              required: true,
              type: 'password',
              placeholder: 'Enter your password',
              onChange: (e) => setPassword(e.target.value),
            },
            {
              label: 'Confirm Password',
              required: true,
              type: 'password',
              placeholder: 'Confirm your password',
              onChange: (e) => setConfirmPassword(e.target.value),
            },
          ],
          submitButton: success ? 'Success!' : 'Sign Up',
          textVariantButton: 'Already have an account? Sign in',
        }}
        goTo={(e) => {
          e.preventDefault();
          navigate('/login');
        }}
        handleSubmit={handleSubmit}
        errorField={error}
        googleLogin="Sign up with Google"
        onGoogleLogin={handleGoogleSignUp}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        success={success}
      />
    </div>
  );
};

export default SignUpPage;
