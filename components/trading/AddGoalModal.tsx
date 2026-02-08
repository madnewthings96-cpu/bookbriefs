import React, { useState } from 'react';
import { GoalType } from '../../utils/tradingUtils';
import { X, Target, TrendingUp, Brain, Flame } from 'lucide-react';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goalData: GoalFormData) => Promise<void>;
    currentBalance: number;
}

export interface GoalFormData {
    type: GoalType;
    title: string;
    target: number;
    unit: string;
    behaviorToAvoid?: string;
}

const GOAL_TYPES = [
    { value: 'balance', label: 'Balance Target', icon: Target, color: 'text-emerald-500', description: 'Reach a specific account balance' },
    { value: 'winRate', label: 'Win Rate Target', icon: TrendingUp, color: 'text-blue-500', description: 'Achieve a target win rate' },
    { value: 'behavior', label: 'Behavior Goal', icon: Brain, color: 'text-purple-500', description: 'Avoid specific trading emotions' },
    { value: 'streak', label: 'Streak Goal', icon: Flame, color: 'text-orange-500', description: 'Maintain a win streak' },
];

const BEHAVIORS_TO_AVOID = ['FOMO', 'Revenge', 'Overconfident', 'Impulsive', 'Greedy'];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave, currentBalance }) => {
    const [selectedType, setSelectedType] = useState<GoalType>('balance');
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [behaviorToAvoid, setBehaviorToAvoid] = useState('FOMO');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting goal:', { selectedType, title, target, behaviorToAvoid });
        setIsSubmitting(true);

        try {
            const goalData: GoalFormData = {
                type: selectedType,
                title: title || getDefaultTitle(),
                target: parseFloat(target),
                unit: getUnit(),
                behaviorToAvoid: selectedType === 'behavior' ? behaviorToAvoid : undefined,
            };
            await onSave(goalData);
            handleClose();
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Failed to save goal. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedType('balance');
        setTitle('');
        setTarget('');
        setBehaviorToAvoid('FOMO');
        onClose();
    };

    const getDefaultTitle = () => {
        switch (selectedType) {
            case 'balance':
                return `Reach $${target} balance`;
            case 'winRate':
                return `Achieve ${target}% win rate`;
            case 'behavior':
                return `Avoid ${behaviorToAvoid} for 30 days`;
            case 'streak':
                return `Build a ${target}-trade win streak`;
            default:
                return 'Trading Goal';
        }
    };

    const getUnit = () => {
        switch (selectedType) {
            case 'balance':
                return '$';
            case 'winRate':
                return '%';
            case 'behavior':
                return 'days';
            case 'streak':
                return 'trades';
            default:
                return '';
        }
    };

    const getPlaceholder = () => {
        switch (selectedType) {
            case 'balance':
                return '15000';
            case 'winRate':
                return '55';
            case 'behavior':
                return '30';
            case 'streak':
                return '5';
            default:
                return '';
        }
    };

    const getTargetLabel = () => {
        switch (selectedType) {
            case 'balance':
                return 'Target Balance ($)';
            case 'winRate':
                return 'Target Win Rate (%)';
            case 'behavior':
                return 'Days to Avoid';
            case 'streak':
                return 'Streak Length (trades)';
            default:
                return 'Target';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Add New Goal</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Goal Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Goal Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {GOAL_TYPES.map(({ value, label, icon: Icon, color, description }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setSelectedType(value as GoalType)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedType === value
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className={`w-6 h-6 ${color} mb-2`} />
                                    <div className="font-medium text-gray-800">{label}</div>
                                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Behavior Selection (for behavior goals) */}
                    {selectedType === 'behavior' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Emotion to Avoid
                            </label>
                            <select
                                value={behaviorToAvoid}
                                onChange={(e) => setBehaviorToAvoid(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {BEHAVIORS_TO_AVOID.map((behavior) => (
                                    <option key={behavior} value={behavior}>
                                        {behavior}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Target Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {getTargetLabel()}
                        </label>
                        <input
                            type="number"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder={getPlaceholder()}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                        {selectedType === 'balance' && (
                            <p className="text-xs text-gray-400 mt-1">
                                Current balance: ${currentBalance.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Custom Title (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Goal Title (optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={getDefaultTitle() || 'Custom goal title...'}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !target}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Target className="w-5 h-5" />
                                Add Goal
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddGoalModal;
