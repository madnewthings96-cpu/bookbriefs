import React from 'react';
import { Goal, formatCurrency } from '../../utils/tradingUtils';
import { Target, TrendingUp, Brain, Flame, CheckCircle2, Trash2 } from 'lucide-react';

interface GoalsSectionProps {
    goals: Goal[];
    currentBalance: number;
    onDeleteGoal?: (goalId: string) => void;
}

const GoalsSection: React.FC<GoalsSectionProps> = ({ goals, currentBalance, onDeleteGoal }) => {
    if (goals.length === 0) {
        return null;
    }

    const getGoalIcon = (type: Goal['type']) => {
        switch (type) {
            case 'balance':
                return <Target className="w-5 h-5 text-emerald-500" />;
            case 'winRate':
                return <TrendingUp className="w-5 h-5 text-blue-500" />;
            case 'behavior':
                return <Brain className="w-5 h-5 text-purple-500" />;
            case 'streak':
                return <Flame className="w-5 h-5 text-orange-500" />;
            default:
                return <Target className="w-5 h-5 text-gray-500" />;
        }
    };

    const calculateProgress = (goal: Goal): number => {
        if (goal.type === 'balance') {
            // For balance goals, calculate based on current balance vs target
            const progress = (currentBalance / goal.target) * 100;
            return Math.min(progress, 100);
        }
        // For other goals, use the stored current value
        return Math.min((goal.current / goal.target) * 100, 100);
    };

    const formatGoalValue = (goal: Goal, value: number): string => {
        if (goal.unit === '$') {
            return formatCurrency(value, false);
        }
        if (goal.unit === '%') {
            return `${value.toFixed(1)}%`;
        }
        return `${value} ${goal.unit}`;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Active Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => {
                    const progress = calculateProgress(goal);
                    const isCompleted = progress >= 100;
                    const currentValue = goal.type === 'balance' ? currentBalance : goal.current;

                    return (
                        <div
                            key={goal.id}
                            className={`p-4 rounded-lg border ${isCompleted
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        getGoalIcon(goal.type)
                                    )}
                                    <span className="font-medium text-gray-800">{goal.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {formatGoalValue(goal, currentValue)} / {formatGoalValue(goal, goal.target)}
                                </span>
                            </div>
                            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isCompleted
                                        ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-xs text-gray-400">
                                    {progress.toFixed(0)}% complete
                                </span>
                                <div className="flex items-center gap-2">
                                    {goal.deadline && (
                                        <span className="text-xs text-gray-400">
                                            Due: {goal.deadline.toDate().toLocaleDateString()}
                                        </span>
                                    )}
                                    {onDeleteGoal && (
                                        <button
                                            onClick={() => onDeleteGoal(goal.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete goal"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalsSection;
