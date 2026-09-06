
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthGateway } from '../components/AuthGateway';

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

  return (
    <AuthGateway
      mode="signup"
      name={name}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      error={error}
      success={success}
      isLoading={isLoading}
      isGoogleLoading={isGoogleLoading}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
      onGoogleAuth={handleGoogleSignUp}
      onSwitchMode={() => navigate('/login')}
      onGoHome={() => navigate('/')}
    />
  );
};

export default SignUpPage;
