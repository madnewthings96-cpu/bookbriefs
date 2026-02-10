import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../App';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useSEO from '../hooks/useSEO';

// Trading Components
import StatCard from '../components/trading/StatCard';
import EquityCurve from '../components/trading/EquityCurve';
import AddTradeModal from '../components/trading/AddTradeModal';
import TradeTable from '../components/trading/TradeTable';
import TradeCalendar from '../components/trading/TradeCalendar';
import StartingBalanceModal from '../components/trading/StartingBalanceModal';
import StreakBanner from '../components/trading/StreakBanner';
import GoalsSection from '../components/trading/GoalsSection';
import AddGoalModal, { GoalFormData } from '../components/trading/AddGoalModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportReportModal from '../components/trading/ExportReportModal';

// Utilities
import {
    Trade,
    TradeFormData,
    Goal,
    calculateStats,
    calculateCumulativePnL,
    calculateStreak,
    formatCurrency,
} from '../utils/tradingUtils';
import { BookOpen, Plus, Wallet, Edit2, Banknote, Percent, TrendingUp, Scale, Table2, Calendar, Target, FileDown } from 'lucide-react';

const TradingJournalPage: React.FC = () => {
    const { currentUser } = useFirebase();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [startingBalance, setStartingBalance] = useState(10000);
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);

    useSEO({
        title: 'Trading Journal - Ta7leel | BookBriefs',
        description: 'Professional trading journal. Track your trades, analyze performance, and master your psychology.',
        keywords: 'trading journal, trade tracker, trading psychology, performance analytics',
        type: 'website',
    });

    // Load trades from Firestore (real-time)
    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const tradesQuery = query(
            collection(db, 'users', currentUser.uid, 'trades'),
            orderBy('entryDate', 'desc')
        );

        const unsubscribe = onSnapshot(tradesQuery, (snapshot) => {
            const tradesData: Trade[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Trade[];

            // Client-side sort to ensure stable ordering
            // 1. Sort by Entry Date (descending)
            // 2. Sort by Created At (descending) for same-day trades
            tradesData.sort((a, b) => {
                const dateA = a.entryDate?.toMillis?.() || 0;
                const dateB = b.entryDate?.toMillis?.() || 0;

                if (dateA !== dateB) {
                    return dateB - dateA;
                }

                const createdA = a.createdAt?.toMillis?.() || 0;
                const createdB = b.createdAt?.toMillis?.() || 0;
                return createdB - createdA;
            });

            setTrades(tradesData);
            setIsLoading(false);
        }, (error) => {
            console.error('Error loading trades:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch starting balance
    useEffect(() => {
        if (!currentUser) return;

        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'users', currentUser.uid, 'trading_settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().startingBalance) {
                    setStartingBalance(docSnap.data().startingBalance);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings();
    }, [currentUser]);

    // Calculate derived stats
    const stats = useMemo(() => calculateStats(trades), [trades]);
    const equityCurveData = useMemo(() => calculateCumulativePnL(trades, startingBalance), [trades, startingBalance]);
    const currentBalance = startingBalance + stats.totalPnL;
    const streak = useMemo(() => calculateStreak(trades), [trades]);

    // Load goals from Firestore (real-time)
    useEffect(() => {
        if (!currentUser) return;

        const goalsQuery = query(
            collection(db, 'users', currentUser.uid, 'goals'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(goalsQuery, (snapshot) => {
            const goalsData: Goal[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Goal[];
            setGoals(goalsData.filter(g => !g.completed));
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Handle save balance
    const handleSaveBalance = async (newBalance: number) => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, 'users', currentUser.uid, 'trading_settings', 'general'), {
                startingBalance: newBalance
            }, { merge: true });
            setStartingBalance(newBalance);
        } catch (error) {
            console.error('Error saving balance:', error);
            throw error;
        }
    };

    // Handle save trade (add or update)
    const handleSaveTrade = async (
        formData: TradeFormData,
        calculatedPnL: number,
        status: 'WIN' | 'LOSS' | 'BE'
    ) => {
        if (!currentUser) return;

        const entryPrice = parseFloat(formData.entryPrice);
        const exitPrice = parseFloat(formData.exitPrice);
        const stopLoss = formData.stopLoss ? parseFloat(formData.stopLoss) : 0;

        // Calculate R-Multiple
        let rr = 0;
        if (stopLoss > 0 && entryPrice > 0) {
            if (formData.direction === 'LONG') {
                const risk = entryPrice - stopLoss;
                if (risk !== 0) {
                    rr = (exitPrice - entryPrice) / risk;
                }
            } else {
                const risk = stopLoss - entryPrice;
                if (risk !== 0) {
                    rr = (entryPrice - exitPrice) / risk;
                }
            }
        }

        const tradeData = {
            symbol: formData.symbol,
            direction: formData.direction,
            entryDate: Timestamp.fromDate(new Date(formData.entryDate)),
            entryPrice,
            exitPrice,
            stopLoss,
            lotSize: parseFloat(formData.lotSize),
            pnl: calculatedPnL,
            rr: parseFloat(rr.toFixed(2)),
            status,
            setup: formData.setup,
            emotions: formData.emotions,
            notes: formData.notes,
            screenshotUrl: formData.screenshotUrl,
        };

        try {
            if (editingTrade) {
                // Update existing trade
                await updateDoc(
                    doc(db, 'users', currentUser.uid, 'trades', editingTrade.id),
                    tradeData
                );
            } else {
                // Add new trade
                await addDoc(collection(db, 'users', currentUser.uid, 'trades'), {
                    ...tradeData,
                    createdAt: Timestamp.now(),
                });
            }
            setEditingTrade(null);
        } catch (error) {
            console.error('Error saving trade:', error);
            throw error;
        }
    };

    // Handle edit trade
    const handleEditTrade = (trade: Trade) => {
        setEditingTrade(trade);
        setShowModal(true);
    };

    // Handle delete trade
    const handleDeleteTrade = async (tradeId: string) => {
        if (!currentUser) return;

        if (!window.confirm('Are you sure you want to delete this trade?')) return;

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'trades', tradeId));
        } catch (error) {
            console.error('Error deleting trade:', error);
        }
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTrade(null);
    };

    // Handle save goal
    const handleSaveGoal = async (goalData: GoalFormData) => {
        if (!currentUser) {
            console.error('No current user found');
            alert('You must be logged in to save goals.');
            return;
        }

        console.log('Saving goal to Firestore:', goalData);

        // Sanitize data to remove undefined values
        const goalToSave = {
            type: goalData.type,
            title: goalData.title,
            target: goalData.target,
            unit: goalData.unit,
            current: goalData.type === 'balance' ? currentBalance : 0,
            createdAt: Timestamp.now(),
            completed: false,
            ...(goalData.behaviorToAvoid ? { behaviorToAvoid: goalData.behaviorToAvoid } : {}),
        };

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'goals'), goalToSave);
            console.log('Goal saved successfully');
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Failed to save goal. Please check your data and try again.');
            throw error;
        }
    };

    // Handle delete goal click
    const handleDeleteGoal = (goalId: string) => {
        setGoalToDelete(goalId);
    };

    // Confirm delete goal
    const confirmDeleteGoal = async () => {
        if (!currentUser || !goalToDelete) return;

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalToDelete));
            setGoalToDelete(null);
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('Failed to delete goal.');
        }
    };

    // Not logged in state
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 text-center shadow-sm">
                    <BookOpen className="w-16 h-16 mx-auto text-orange-500 mb-4" strokeWidth={1.5} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Trading Journal</h2>
                    <p className="text-gray-600 mb-6">Sign in to track your trades and master your trading psychology.</p>
                    <a
                        href="/login"
                        className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Sign In to Continue
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gray-50 text-gray-800"
            style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}
        >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Trading Journal</h1>
                        <p className="text-gray-500 text-sm mt-1">Track, analyze, and master your trading</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            <FileDown className="w-5 h-5 text-gray-500" />
                            Export
                        </button>
                        <button
                            onClick={() => setShowGoalModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            <Target className="w-5 h-5 text-orange-500" />
                            Add Goal
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Add Trade
                        </button>
                    </div>
                </div>

                {/* Streak Banner */}
                {streak.count > 0 && <StreakBanner streak={streak} />}

                {/* Goals Section */}
                <GoalsSection
                    goals={goals}
                    currentBalance={currentBalance}
                    onDeleteGoal={handleDeleteGoal}
                />

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Account Balance Card */}
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500">Account Balance</span>
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {formatCurrency(currentBalance)}
                            </h3>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stats.totalPnL >= 0
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600'
                                }`}>
                                {stats.totalPnL >= 0 ? '+' : ''}{((stats.totalPnL / startingBalance) * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Start: {formatCurrency(startingBalance)}
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => setShowBalanceModal(true)}
                            className="absolute top-4 right-14 p-1 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Starting Balance"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    <StatCard
                        title="Total P&L"
                        value={formatCurrency(stats.totalPnL)}
                        subtitle={`${stats.totalTrades} trades`}
                        valueColor={stats.totalPnL > 0 ? 'profit' : stats.totalPnL < 0 ? 'loss' : 'neutral'}
                        icon={
                            <Banknote className="w-5 h-5" />
                        }
                    />
                    <StatCard
                        title="Win Rate"
                        value={`${stats.winRate}%`}
                        subtitle={`${stats.wins}W / ${stats.losses}L`}
                        valueColor={stats.winRate >= 50 ? 'profit' : 'loss'}
                        icon={
                            <Percent className="w-5 h-5" />
                        }
                    />
                    <StatCard
                        title="Profit Factor"
                        value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
                        subtitle="Gross P / Gross L"
                        valueColor={stats.profitFactor >= 1 ? 'profit' : 'loss'}
                        icon={
                            <TrendingUp className="w-5 h-5" />
                        }
                    />
                    <StatCard
                        title="Avg R:R"
                        value={stats.avgRR >= 999 ? '∞' : stats.avgRR.toFixed(2)}
                        subtitle="Avg Win / Avg Loss"
                        valueColor={stats.avgRR >= 1 ? 'profit' : 'loss'}
                        icon={
                            <Scale className="w-5 h-5" />
                        }
                    />
                </div>

                {/* Equity Curve */}
                <EquityCurve data={equityCurveData} goals={goals} />

                {/* View Toggle */}
                <div className="flex justify-end">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Table2 className="w-4 h-4" />
                                Table
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Calendar
                            </div>
                        </button>
                    </div>
                </div>

                {/* Trade Table or Calendar */}
                {viewMode === 'table' ? (
                    <TradeTable
                        trades={trades}
                        onEdit={handleEditTrade}
                        onDelete={handleDeleteTrade}
                        isLoading={isLoading}
                    />
                ) : (
                    <TradeCalendar
                        trades={trades}
                        onEditTrade={handleEditTrade}
                    />
                )}

                {/* Support Section */}
                <div className="flex justify-center pt-4 pb-8">
                    <a
                        href="https://ko-fi.com/ta7leel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block transition-transform hover:scale-110 active:scale-95"
                    >
                        <img
                            src="/ko-fi icon.webp"
                            alt="Support us on Ko-fi"
                            className="h-12 w-auto"
                        />
                    </a>
                </div>
            </div>

            {/* Add/Edit Trade Modal */}
            <AddTradeModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveTrade}
                editingTrade={editingTrade}
            />

            {/* Starting Balance Modal */}
            <StartingBalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                onSave={handleSaveBalance}
                currentBalance={startingBalance}
            />

            {/* Add Goal Modal */}
            <AddGoalModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                onSave={handleSaveGoal}
                currentBalance={currentBalance}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!goalToDelete}
                onClose={() => setGoalToDelete(null)}
                onConfirm={confirmDeleteGoal}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? This action cannot be undone."
                confirmText="Delete Goal"
                variant="danger"
            />

            {/* Export Report Modal */}
            <ExportReportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                trades={trades}
                startingBalance={startingBalance}
                currentBalance={currentBalance}
                userEmail={currentUser?.email || undefined}
            />
        </div>
    );
};

export default TradingJournalPage;
