import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../App';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useSEO from '../hooks/useSEO';
import './TradingJournalPage.css';

// Trading Components
import StatCard from '../components/trading/StatCard';
import AddTradeModal from '../components/trading/AddTradeModal';
import TradeTable from '../components/trading/TradeTable';
import TradeCalendar from '../components/trading/TradeCalendar';
import StartingBalanceModal from '../components/trading/StartingBalanceModal';
import StreakBanner from '../components/trading/StreakBanner';
import GoalsSection from '../components/trading/GoalsSection';
import AddGoalModal, { GoalFormData } from '../components/trading/AddGoalModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportReportModal from '../components/trading/ExportReportModal';
import TradingReviewDrawer from '../components/trading/TradingReviewDrawer';
import TradingCommandCenter from '../components/trading/TradingCommandCenter';
import { BreakdownAnalytics, OverviewInsights, ReviewPanel } from '../components/trading/TradingAnalyticsPanels';
import { getNextTradingTabIndex } from '../components/trading/tradingTabNavigation';

// Utilities
import {
    Trade,
    TradeFormData,
    Goal,
    calculateStats,
    calculateCumulativePnL,
    calculateStreak,
    calculateAdvancedStats,
    calculateBreakdownStats,
    formatCurrency,
} from '../utils/tradingUtils';
import {
    BookOpen,
    Plus,
    Wallet,
    Edit2,
    Banknote,
    Percent,
    TrendingUp,
    Scale,
    Target,
    FileDown,
    LayoutDashboard,
    ListChecks,
    CalendarDays,
    Brain,
    BarChart3,
    ClipboardCheck,
    TrendingDown,
} from 'lucide-react';

type TradingTab = 'overview' | 'trades' | 'calendar' | 'psychology' | 'setups' | 'review';

const TradingJournalPage: React.FC = () => {
    const { currentUser } = useFirebase();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [startingBalance, setStartingBalance] = useState(10000);
    const [activeTab, setActiveTab] = useState<TradingTab>('overview');
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [selectedDay, setSelectedDay] = useState<{ date: Date; trades: Trade[] } | null>(null);

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
    const advancedStats = useMemo(() => calculateAdvancedStats(trades, startingBalance), [trades, startingBalance]);
    const setupBreakdowns = useMemo(() => calculateBreakdownStats(trades, 'setup'), [trades]);
    const emotionBreakdowns = useMemo(() => calculateBreakdownStats(trades, 'emotions'), [trades]);
    const accountReturn = startingBalance > 0 ? (stats.totalPnL / startingBalance) * 100 : 0;
    const commandCurvePoints = useMemo(() => {
        const balances = equityCurveData.map((point) => point.cumulativePnL);
        const min = Math.min(...balances);
        const max = Math.max(...balances);
        const range = Math.max(max - min, 1);

        return balances.map((balance, index) => {
            const x = balances.length === 1 ? 0 : (index / (balances.length - 1)) * 480;
            const y = 76 - ((balance - min) / range) * 62;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }, [equityCurveData]);

    const tabs: Array<{ id: TradingTab; label: string; icon: React.ReactNode }> = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'trades', label: 'Trades', icon: <ListChecks className="w-4 h-4" /> },
        { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'psychology', label: 'Psychology', icon: <Brain className="w-4 h-4" /> },
        { id: 'setups', label: 'Setups', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'review', label: 'Review', icon: <ClipboardCheck className="w-4 h-4" /> },
    ];

    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
        const nextIndex = getNextTradingTabIndex(event.key, currentIndex, tabs.length);
        if (nextIndex === null) return;

        event.preventDefault();
        const nextTab = tabs[nextIndex];
        setActiveTab(nextTab.id);
        window.requestAnimationFrame(() => document.getElementById(`trading-tab-${nextTab.id}`)?.focus());
    };

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
            entryDate: Timestamp.fromDate(new Date(`${formData.entryDate}T00:00:00.000Z`)),
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
        setSelectedTrade(null);
        setSelectedDay(null);
        setShowModal(true);
    };

    const handleSelectTrade = (trade: Trade) => {
        setSelectedTrade(trade);
        setSelectedDay(null);
    };

    const handleSelectDay = (date: Date, dayTrades: Trade[]) => {
        setSelectedDay({ date, trades: dayTrades });
        setSelectedTrade(null);
    };

    const handleCloseReviewDrawer = () => {
        setSelectedTrade(null);
        setSelectedDay(null);
    };

    // Handle delete trade
    const handleDeleteTrade = async (tradeId: string) => {
        if (!currentUser) return;

        if (!window.confirm('Are you sure you want to delete this trade?')) return;

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'trades', tradeId));
            setSelectedTrade((trade) => trade?.id === tradeId ? null : trade);
            setSelectedDay((day) => {
                if (!day) return day;
                const remainingTrades = day.trades.filter((trade) => trade.id !== tradeId);
                return remainingTrades.length > 0 ? { ...day, trades: remainingTrades } : null;
            });
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
                        className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]"
                    >
                        Sign In to Continue
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="trading-fieldbook min-h-screen text-[#16231E]">
            <main className="fieldbook-shell mx-auto max-w-[1440px] px-3 pb-10 pt-4 sm:px-5 sm:pt-6 lg:px-8">
                <header className="fieldbook-command">
                    <div className="fieldbook-command-grid" aria-hidden="true" />
                    <div className="relative z-10 flex flex-col gap-5 px-5 pb-4 pt-5 sm:px-7 sm:pt-7 lg:flex-row lg:items-start lg:justify-between lg:px-9">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D7AE69] sm:text-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#D7AE69] shadow-[0_0_0_4px_rgba(215,174,105,0.12)]" />
                                Ta7leel Trading Fieldbook
                            </div>
                            <h1 className="mt-3 max-w-[620px] font-serif text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#FFFDF7] sm:text-[46px] lg:text-[54px]">
                                Review the process.<br />Refine the edge.
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#B9C8C0] sm:text-[15px]">
                                A decision journal for performance, risk, and the behavior behind every trade.
                            </p>
                        </div>

                        <div className="fieldbook-actions flex flex-wrap gap-2 lg:max-w-[410px] lg:justify-end">
                            <button type="button" onClick={() => setShowExportModal(true)} className="fieldbook-button fieldbook-button-secondary">
                                <FileDown aria-hidden="true" className="h-4 w-4" />
                                Export fieldbook
                            </button>
                            <button type="button" onClick={() => setShowGoalModal(true)} className="fieldbook-button fieldbook-button-secondary">
                                <Target aria-hidden="true" className="h-4 w-4 text-[#D7AE69]" />
                                New goal
                            </button>
                            <button type="button" onClick={() => setShowModal(true)} className="fieldbook-button fieldbook-button-primary">
                                <Plus aria-hidden="true" className="h-4 w-4" />
                                Log trade
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 grid gap-5 border-t border-white/10 px-5 py-5 sm:px-7 lg:grid-cols-[0.72fr_1.28fr] lg:px-9 lg:py-7">
                        <div className="group relative">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#91A79C]">
                                <Wallet aria-hidden="true" className="h-4 w-4 text-[#D7AE69]" />
                                Live account balance
                            </div>
                            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                                <p className="text-[38px] font-bold leading-none tracking-[-0.045em] text-white tabular-nums sm:text-[50px]">
                                    {formatCurrency(currentBalance, false)}
                                </p>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${accountReturn >= 0 ? 'bg-[#2F8A67]/18 text-[#8DD0AF]' : 'bg-[#C65B50]/18 text-[#F0A095]'}`}>
                                    {accountReturn >= 0 ? '+' : ''}{accountReturn.toFixed(2)}%
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBalanceModal(true)}
                                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-[#B9C8C0] transition hover:border-[#D7AE69]/35 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7AE69]"
                            >
                                <Edit2 aria-hidden="true" className="h-3.5 w-3.5" />
                                Opening {formatCurrency(startingBalance, false)}
                            </button>
                        </div>

                        <div className="fieldbook-inkline">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D7AE69]">Performance inkline</p>
                                    <p className="mt-1 text-xs text-[#9FB1A8]">{stats.totalTrades} decisions · live account trajectory</p>
                                </div>
                                <p className={`text-sm font-bold tabular-nums ${stats.totalPnL >= 0 ? 'text-[#8DD0AF]' : 'text-[#F0A095]'}`}>
                                    {formatCurrency(stats.totalPnL)}
                                </p>
                            </div>
                            <svg role="img" aria-label="Account performance line" viewBox="0 0 480 90" preserveAspectRatio="none" className="mt-3 h-[76px] w-full overflow-visible">
                                <defs>
                                    <linearGradient id="fieldbook-line-gradient" x1="0" x2="1">
                                        <stop offset="0" stopColor="#C89A49" />
                                        <stop offset="1" stopColor={stats.totalPnL >= 0 ? '#77C49E' : '#E38B80'} />
                                    </linearGradient>
                                </defs>
                                <path d="M0 77 H480" stroke="rgba(255,255,255,.09)" strokeWidth="1" />
                                <path d="M0 45 H480" stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="4 6" />
                                <polyline points={commandCurvePoints} fill="none" stroke="url(#fieldbook-line-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                            </svg>
                        </div>
                    </div>
                </header>

                <div className="mt-4 space-y-4 sm:mt-5">
                    {streak.count > 0 && <StreakBanner streak={streak} />}

                    <GoalsSection goals={goals} currentBalance={currentBalance} onDeleteGoal={handleDeleteGoal} />

                    <section aria-label="Account performance metrics" className="fieldbook-metrics grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5 lg:gap-3">
                        <StatCard title="Total P&L" value={formatCurrency(stats.totalPnL)} subtitle={`${stats.totalTrades} trades`} valueColor={stats.totalPnL > 0 ? 'profit' : stats.totalPnL < 0 ? 'loss' : 'neutral'} icon={<Banknote className="h-5 w-5" />} />
                        <StatCard title="Win Rate" value={`${stats.winRate}%`} subtitle={`${stats.wins}W / ${stats.losses}L`} valueColor={stats.winRate >= 50 ? 'profit' : 'loss'} icon={<Percent className="h-5 w-5" />} />
                        <StatCard title="Profit Factor" value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)} subtitle="Gross profit / loss" valueColor={stats.profitFactor >= 1 ? 'profit' : 'loss'} icon={<TrendingUp className="h-5 w-5" />} />
                        <StatCard title="Average R" value={stats.avgRR >= 999 ? '∞' : stats.avgRR.toFixed(2)} subtitle="Reward per unit risk" valueColor={stats.avgRR >= 1 ? 'profit' : 'loss'} icon={<Scale className="h-5 w-5" />} />
                        <StatCard title="Max Drawdown" value={`${advancedStats.maxDrawdownPercent.toFixed(2)}%`} subtitle={formatCurrency(-advancedStats.maxDrawdownValue)} valueColor={advancedStats.maxDrawdownValue > 0 ? 'loss' : 'neutral'} icon={<TrendingDown className="h-5 w-5" />} />
                    </section>

                    <nav aria-label="Trading journal sections" className="fieldbook-tab-shell">
                        <div role="tablist" aria-label="Trading journal views" className="fieldbook-tabs">
                            {tabs.map((tab, index) => (
                                <button
                                    key={tab.id}
                                    id={`trading-tab-${tab.id}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls="trading-panel"
                                    tabIndex={activeTab === tab.id ? 0 : -1}
                                    onClick={() => setActiveTab(tab.id)}
                                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                                    className={`fieldbook-tab ${activeTab === tab.id ? 'fieldbook-tab-active' : ''}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <section
                        id="trading-panel"
                        role="tabpanel"
                        aria-labelledby={`trading-tab-${activeTab}`}
                        className="fieldbook-panel"
                    >
                        {activeTab === 'overview' && (
                            <div className="space-y-5">
                                <TradingCommandCenter
                                    trades={trades}
                                    stats={stats}
                                    advancedStats={advancedStats}
                                    equityCurveData={equityCurveData}
                                    goals={goals}
                                    streak={streak}
                                    startingBalance={startingBalance}
                                    onAddTrade={() => setShowModal(true)}
                                    onAddGoal={() => setShowGoalModal(true)}
                                />
                                <OverviewInsights stats={stats} advancedStats={advancedStats} />
                            </div>
                        )}

                        {activeTab === 'trades' && <TradeTable trades={trades} onEdit={handleEditTrade} onDelete={handleDeleteTrade} onSelect={handleSelectTrade} isLoading={isLoading} />}

                        {activeTab === 'calendar' && <TradeCalendar trades={trades} onSelectTrade={handleSelectTrade} onSelectDay={handleSelectDay} />}

                        {activeTab === 'psychology' && <BreakdownAnalytics title="Psychology Analytics" description="See which emotional states are helping or hurting execution." icon={<Brain className="h-5 w-5" />} breakdowns={emotionBreakdowns} />}

                        {activeTab === 'setups' && <BreakdownAnalytics title="Setup Performance" description="Compare strategies by P&L, win rate, average R, and trade count." icon={<Target className="h-5 w-5" />} breakdowns={setupBreakdowns} />}

                        {activeTab === 'review' && <ReviewPanel stats={stats} advancedStats={advancedStats} setupBreakdowns={setupBreakdowns} emotionBreakdowns={emotionBreakdowns} />}
                    </section>

                    <div className="flex justify-center pb-8 pt-4">
                        <a href="https://ko-fi.com/ta7leel" target="_blank" rel="noopener noreferrer" className="fieldbook-support-link">
                            <img src="/ko-fi icon.webp" alt="Support Ta7leel on Ko-fi" className="h-10 w-auto" />
                        </a>
                    </div>
                </div>
            </main>

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

            <TradingReviewDrawer
                trade={selectedTrade}
                day={selectedDay}
                onClose={handleCloseReviewDrawer}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
                onSelectTrade={handleSelectTrade}
            />
        </div>
    );
};

export default TradingJournalPage;
