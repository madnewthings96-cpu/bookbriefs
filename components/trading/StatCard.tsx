import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    valueColor?: 'profit' | 'loss' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon,
    valueColor = 'neutral',
}) => {
    const getValueColorClass = () => {
        switch (valueColor) {
            case 'profit':
                return 'text-emerald-600';
            case 'loss':
                return 'text-rose-600';
            default:
                return 'text-gray-800';
        }
    };

    const getTrendIcon = () => {
        if (!trend || trend === 'neutral') return null;

        if (trend === 'up') {
            return <ArrowUp className="w-4 h-4 text-emerald-400" />;
        }

        return <ArrowDown className="w-4 h-4 text-rose-400" />;
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${getValueColorClass()}`}>
                            {value}
                        </p>
                        {getTrendIcon()}
                    </div>
                    {subtitle && (
                        <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="text-gray-400 bg-gray-50 p-2 rounded-lg">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
