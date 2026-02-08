import React from 'react';
import { StreakInfo } from '../../utils/tradingUtils';
import { Flame, AlertTriangle, TrendingUp } from 'lucide-react';

interface StreakBannerProps {
    streak: StreakInfo;
}

const StreakBanner: React.FC<StreakBannerProps> = ({ streak }) => {
    if (streak.type === 'neutral' && streak.count === 0) {
        return null; // Don't show banner for neutral/no streak
    }

    const getBannerStyles = () => {
        switch (streak.type) {
            case 'win':
                return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
            case 'loss':
                return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
        }
    };

    const getIcon = () => {
        switch (streak.type) {
            case 'win':
                return <Flame className="w-5 h-5" />;
            case 'loss':
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <TrendingUp className="w-5 h-5" />;
        }
    };

    return (
        <div className={`${getBannerStyles()} rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg`}>
            {getIcon()}
            <span className="font-medium">{streak.message}</span>
            {streak.type === 'win' && streak.count >= 3 && (
                <div className="ml-auto flex gap-1">
                    {Array.from({ length: Math.min(streak.count, 5) }).map((_, i) => (
                        <span key={i} className="text-lg">🔥</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StreakBanner;
