
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthTabs, TechOrbitDisplay, Ripple } from '../components/AnimatedAuthComponents';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email.trim(), password);

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address. Please check your email or sign up for a new account.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again or reset your password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later or reset your password.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please check your credentials and try again.');
          break;
        default:
          setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setIsGoogleLoading(true);

    try {
      // Sign in with Google
      await signInWithPopup(auth, googleProvider);

      // Show success message
      setSuccess('Login successful with Google! Redirecting...');

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Google login error:', err);
      
      // Handle specific Google sign-in errors
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Login cancelled. Please try again.');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up blocked by browser. Please allow pop-ups and try again.');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email using a different sign-in method. Please use email/password login.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        case 'auth/user-disabled':
          setError('This Google account has been disabled. Please contact support.');
          break;
        default:
          setError('Google login failed. Please try again.');
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

      {/* Right Side - Login Form */}
      <AuthTabs
        formFields={{
          header: 'Welcome Back',
          subHeader: 'Sign in to your BookBriefs account',
          fields: [
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
          ],
          submitButton: success ? 'Success!' : 'Sign In',
          textVariantButton: "Don't have an account? Sign up",
        }}
        goTo={(e) => {
          e.preventDefault();
          navigate('/signup');
        }}
        handleSubmit={handleSubmit}
        errorField={error}
        googleLogin="Sign in with Google"
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        success={success}
      />
    </div>
  );
};

export default LoginPage;
