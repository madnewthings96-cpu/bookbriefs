import React, { useState, useEffect, useRef } from 'react';
import { GoalType } from '../../utils/tradingUtils';
import { X, Target, TrendingUp, Brain, Flame } from 'lucide-react';
import { AsyncIdentityGuard } from '../asyncIdentityGuard';
import { useModalDialog } from '../../hooks/useModalDialog';

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
    { value: 'streak', label: 'Streak Goal', icon: Flame, color: 'text-[#9a7b45]', description: 'Maintain a win streak' },
];

const BEHAVIORS_TO_AVOID = ['FOMO', 'Revenge', 'Overconfident', 'Impulsive', 'Greedy'];

const getDefaultGoalTitle = (type: GoalType, target: string, behaviorToAvoid: string) => {
    switch (type) {
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

const getGoalUnit = (type: GoalType) => {
    switch (type) {
        case 'balance': return '$';
        case 'winRate': return '%';
        case 'behavior': return 'days';
        case 'streak': return 'trades';
        default: return '';
    }
};

const getGoalPlaceholder = (type: GoalType) => {
    switch (type) {
        case 'balance': return '15000';
        case 'winRate': return '55';
        case 'behavior': return '30';
        case 'streak': return '5';
        default: return '';
    }
};

const getGoalTargetLabel = (type: GoalType) => {
    switch (type) {
        case 'balance': return 'Target Balance ($)';
        case 'winRate': return 'Target Win Rate (%)';
        case 'behavior': return 'Days to Avoid';
        case 'streak': return 'Streak Length (trades)';
        default: return 'Target';
    }
};

interface GoalFormDetailsProps {
    selectedType: GoalType;
    target: string;
    title: string;
    behaviorToAvoid: string;
    currentBalance: number;
    targetInputRef: React.RefObject<HTMLInputElement>;
    onTargetChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    onBehaviorChange: (value: string) => void;
}

export const GoalFormDetails: React.FC<GoalFormDetailsProps> = ({
    selectedType,
    target,
    title,
    behaviorToAvoid,
    currentBalance,
    targetInputRef,
    onTargetChange,
    onTitleChange,
    onBehaviorChange,
}) => (
    <>
        {selectedType === 'behavior' && (
            <div>
                <label htmlFor="goal-behavior" className="mb-2 block text-sm font-semibold text-[#294a3e]">Emotion to Avoid</label>
                <select
                    id="goal-behavior"
                    value={behaviorToAvoid}
                    onChange={(event) => onBehaviorChange(event.target.value)}
                    className="w-full rounded-lg border border-[#d8ccb7] bg-[#fffefb] px-4 py-3 text-[#173b2f] focus:border-transparent focus:ring-2 focus:ring-[#9a7b45]"
                >
                    {BEHAVIORS_TO_AVOID.map((behavior) => <option key={behavior} value={behavior}>{behavior}</option>)}
                </select>
            </div>
        )}
        <div>
            <label htmlFor="goal-target" className="mb-2 block text-sm font-semibold text-[#294a3e]">{getGoalTargetLabel(selectedType)}</label>
            <div className="relative">
                <input
                    id="goal-target"
                    ref={targetInputRef}
                    type="number"
                    value={target}
                    onChange={(event) => onTargetChange(event.target.value)}
                    placeholder={getGoalPlaceholder(selectedType)}
                    className="w-full rounded-lg border border-[#d8ccb7] bg-[#fffefb] px-4 py-3 pe-20 text-[#173b2f] focus:border-transparent focus:ring-2 focus:ring-[#9a7b45]"
                    required
                />
                <span className="pointer-events-none absolute inset-y-1 end-1 flex items-center rounded-md bg-[#efe7d6] px-3 text-sm font-semibold text-[#6f5834]" aria-hidden="true">{getGoalUnit(selectedType)}</span>
            </div>
            {selectedType === 'balance' && <p className="mt-1 text-xs text-[#718078]">Current balance: ${currentBalance.toLocaleString()}</p>}
        </div>
        <div>
            <label htmlFor="goal-title" className="mb-2 block text-sm font-semibold text-[#294a3e]">Goal Title (optional)</label>
            <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder={getDefaultGoalTitle(selectedType, target, behaviorToAvoid) || 'Custom goal title...'}
                className="w-full rounded-lg border border-[#d8ccb7] bg-[#fffefb] px-4 py-3 text-[#173b2f] placeholder:text-[#8c9892] focus:border-transparent focus:ring-2 focus:ring-[#9a7b45]"
            />
        </div>
    </>
);

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave, currentBalance }) => {
    const [selectedType, setSelectedType] = useState<GoalType>('balance');
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [behaviorToAvoid, setBehaviorToAvoid] = useState('FOMO');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const operationGuard = useRef(new AsyncIdentityGuard()).current;
    const targetInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        operationGuard.mount();
        return () => operationGuard.unmount();
    }, [operationGuard]);

    useEffect(() => {
        if (!isOpen) {
            operationGuard.invalidate();
            setIsSubmitting(false);
        }
    }, [isOpen, operationGuard]);

    const handleClose = () => {
        operationGuard.invalidate();
        setSelectedType('balance');
        setTitle('');
        setTarget('');
        setBehaviorToAvoid('FOMO');
        onClose();
    };

    const dialogRef = useModalDialog({ open: isOpen, onClose: handleClose, initialFocusRef: targetInputRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = operationGuard.begin();
        if (!token) return;
        setIsSubmitting(true);

        try {
            const goalData: GoalFormData = {
                type: selectedType,
                title: title || getDefaultGoalTitle(selectedType, target, behaviorToAvoid),
                target: parseFloat(target),
                unit: getGoalUnit(selectedType),
                behaviorToAvoid: selectedType === 'behavior' ? behaviorToAvoid : undefined,
            };
            if (!operationGuard.isCurrent(token)) return;
            await onSave(goalData);
            if (!operationGuard.isCurrent(token)) return;
            setIsSubmitting(false);
            handleClose();
        } catch (error) {
            if (operationGuard.isCurrent(token)) {
                console.error('Error saving goal:', error);
                alert('Failed to save goal. Please try again.');
            }
        } finally {
            if (operationGuard.isCurrent(token)) setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#102e24]/75 p-4 backdrop-blur-[8px]"
            onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-goal-modal-title"
                aria-describedby="add-goal-modal-description"
                tabIndex={-1}
                className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] border border-[#b08d57]/45 bg-[#fffdf7] shadow-[0_24px_70px_rgba(16,46,36,0.34)] [&_input]:min-h-11 [&_select]:min-h-11"
                style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#b08d57]/30 px-6 py-5">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a6b3f]">Trading commitment</p>
                        <h2 id="add-goal-modal-title" className="mt-1 font-serif text-2xl font-bold text-[#173b2f]">Set a new goal</h2>
                        <p id="add-goal-modal-description" className="mt-1 text-sm text-[#52665e]">Choose one behavior or outcome to focus on.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close goal dialog"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-transparent text-[#52665e] transition-[scale,color,background-color] duration-150 ease-out hover:bg-[#efe7d6] hover:text-[#173b2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7b45] focus-visible:ring-offset-2 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>

                <form id="add-goal-form" onSubmit={handleSubmit} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                    {/* Goal Type Selection */}
                    <div>
                        <fieldset>
                            <legend className="mb-3 block text-sm font-semibold text-[#294a3e]">Goal Type</legend>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {GOAL_TYPES.map(({ value, label, icon: Icon, color, description }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setSelectedType(value as GoalType)}
                                    aria-pressed={selectedType === value}
                                    className={`relative min-h-11 rounded-xl border p-4 text-start transition-[border-color,background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7b45] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none ${selectedType === value
                                        ? 'border-[#9a7b45] bg-[#f5eedf] shadow-[inset_0_0_0_1px_rgba(154,123,69,0.18)]'
                                        : 'border-[#d8ccb7] bg-[#fffefb] hover:border-[#b8a17b]'
                                        }`}
                                >
                                    {selectedType === value && (
                                        <span className="absolute end-3 top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9a7b45] px-1 text-[10px] font-bold text-white" aria-hidden="true">✓</span>
                                    )}
                                    <Icon className={`mb-2 h-6 w-6 ${color}`} />
                                    <div className="font-semibold text-[#173b2f]">{label}</div>
                                    <div className="mt-1 text-xs text-[#64766e]">{description}</div>
                                </button>
                            ))}
                        </div>
                        </fieldset>
                    </div>

                    <GoalFormDetails
                        selectedType={selectedType}
                        target={target}
                        title={title}
                        behaviorToAvoid={behaviorToAvoid}
                        currentBalance={currentBalance}
                        targetInputRef={targetInputRef}
                        onTargetChange={setTarget}
                        onTitleChange={setTitle}
                        onBehaviorChange={setBehaviorToAvoid}
                    />

                </form>
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#b08d57]/30 bg-[#fffaf0] px-6 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="min-h-11 rounded-lg px-4 py-2 text-sm font-semibold text-[#52665e] transition-[scale,color,background-color] hover:bg-[#efe7d6] hover:text-[#173b2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7b45] focus-visible:ring-offset-2 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-goal-form"
                        disabled={isSubmitting || !target}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#173b2f] px-5 py-3 text-sm font-semibold text-white transition-[scale,background-color] hover:bg-[#102e24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7b45] focus-visible:ring-offset-2 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Target className="h-5 w-5" />
                                Create goal
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddGoalModal;
