import React from 'react';
import { StreakInfo } from '../../utils/tradingUtils';
import { Flame, AlertTriangle, TrendingUp } from 'lucide-react';

interface StreakBannerProps {
    streak: StreakInfo;
}

const StreakBanner: React.FC<StreakBannerProps> = ({ streak }) => {
    const [isVisible, setIsVisible] = React.useState(true);

    // Reset visibility when streak changes
    React.useEffect(() => {
        setIsVisible(true);
    }, [streak.count, streak.type]);

    if (!isVisible || (streak.type === 'neutral' && streak.count === 0)) {
        return null;
    }

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleTakeBreak = () => {
        // Could integrating breathing exercise or focus timer here in future
        // For now, just dismiss with a nice effect
        const audio = new Audio('/sounds/calm.mp3'); // Optional: Add sound if available
        setIsVisible(false);
        // Maybe open a new tab to breathing exercise?
        window.open('https://www.google.com/search?q=breathing+exercise', '_blank');
    };

    const getBannerStyles = () => {
        switch (streak.type) {
            case 'win':
                return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/20';
            case 'loss':
                return 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/20';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
        }
    };

    const getIcon = () => {
        switch (streak.type) {
            case 'win':
                return <Flame className="w-5 h-5 animate-pulse" />;
            case 'loss':
                return <AlertTriangle className="w-5 h-5 animate-bounce" />;
            default:
                return <TrendingUp className="w-5 h-5" />;
        }
    };

    return (
        <div className={`${getBannerStyles()} rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg transition-all duration-300 animate-in slide-in-from-top-2`}>
            <div className="flex items-center gap-2">
                {getIcon()}
                <span className="font-medium">{streak.message}</span>
            </div>

            {/* Win Streak Fire Effect */}
            {streak.type === 'win' && streak.count >= 3 && (
                <div className="ml-auto flex gap-1">
                    {Array.from({ length: Math.min(streak.count, 5) }).map((_, i) => (
                        <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>🔥</span>
                    ))}
                    <button
                        onClick={handleDismiss}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Loss Streak Action */}
            {streak.type === 'loss' && streak.count >= 3 && (
                <div className="ml-auto flex items-center gap-3">
                    <button
                        onClick={handleTakeBreak}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors border border-white/30 backdrop-blur-sm whitespace-nowrap"
                    >
                        Take a Break 🧘
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Standard Dismiss for other cases */}
            {!(streak.type === 'win' && streak.count >= 3) && !(streak.type === 'loss' && streak.count >= 3) && (
                <button
                    onClick={handleDismiss}
                    className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <span className="sr-only">Dismiss</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default StreakBanner;
