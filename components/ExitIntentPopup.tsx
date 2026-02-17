import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase';

const EXIT_POPUP_STORAGE_KEY = 'exit_popup_last_shown';
const POPUP_COOLDOWN_DAYS = 7;

const ExitIntentPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasShown, setHasShown] = useState(false);

    // Helper to check cooldown
    const checkCooldown = () => {
        const lastShown = localStorage.getItem(EXIT_POPUP_STORAGE_KEY);
        if (lastShown) {
            const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
            if (daysSince < POPUP_COOLDOWN_DAYS) return false;
        }
        return true;
    };

    // Show popup
    const showPopup = () => {
        if (!hasShown && checkCooldown()) {
            setIsVisible(true);
            setHasShown(true);
            localStorage.setItem(EXIT_POPUP_STORAGE_KEY, Date.now().toString());
        }
    };

    useEffect(() => {
        // 1. Mouse Leave (Desktop Exit Intent)
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                showPopup();
            }
        };

        // 2. Timer (Time-on-page)
        const timer = setTimeout(() => {
            showPopup();
        }, 180000); // 3 minutes

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timer);
        };
    }, [hasShown]);

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            setIsVisible(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // Success! Close popup
            setIsVisible(false);
            // Optional: User toast for success?
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use. Try logging in.');
                setIsLogin(true);
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found. Create one?');
                setIsLogin(false);
            } else {
                setError(err.message || 'An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsVisible(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    {/* Popup Content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: { type: "spring", stiffness: 300, damping: 25 }
                        }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="relative w-full max-w-4xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-900 transition-all text-white shadow-lg hover:shadow-xl hover:scale-110 cursor-pointer"
                            aria-label="Close popup"
                        >
                            <X size={22} strokeWidth={2.5} />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 p-0 relative h-64 md:h-auto overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 md:hidden" />
                            <img
                                src="/popup.jpg"
                                alt="Trading Journal"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4 z-20 text-white md:hidden">
                                <h3 className="font-bold text-xl drop-shadow-lg">Trading Journal</h3>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white/80 dark:bg-gray-900/80 md:bg-white/90">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 leading-tight">
                                Master the <span className="text-blue-600">Mental Game</span> of Trading
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm md:text-base">
                                Stop guessing and start tracking. Join 2,500+ smart traders and get instant, free access to our powerful trading journal.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleAuth}
                                    type="button"
                                    className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:text-blue-600 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(66,133,244,0.5)] transition-all duration-300 ease-out transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <span className="relative bg-white px-2 text-xs text-gray-500 uppercase">Or</span>
                                </div>

                                <form onSubmit={handleAuth} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                placeholder="Your Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Choose a Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/50"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isLogin ? 'Login to Access' : 'Get Free Access'}
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                    className="text-blue-600 font-semibold hover:underline decoration-2 underline-offset-2"
                                >
                                    {isLogin ? "Sign Up Free" : "Login Here"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ExitIntentPopup;
