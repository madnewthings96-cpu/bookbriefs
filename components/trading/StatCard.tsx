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
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-150 ease-out hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold tabular-nums ${getValueColorClass()}`}>
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
