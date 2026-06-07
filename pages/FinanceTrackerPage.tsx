import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../App';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useSEO from '../hooks/useSEO';
import ReceiptScanner from '../components/ReceiptScanner';
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Download,
    Plus,
    ReceiptText,
    Target,
    Trash2,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    createdAt: Timestamp;
}

interface Goal {
    id: string;
    name: string;
    emoji: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    createdAt: Timestamp;
}

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other Income'],
    expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other'],
};

const PIE_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];
const GOAL_EMOJIS = ['🚗', '🏖️', '🏠', '💻', '📱', '🎓', '💍', '🎸', '🏋️', '✈️'];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);

const formatCompactCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);

const FinanceTrackerPage: React.FC = () => {
    const { currentUser } = useFirebase();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
    });
    const [goalFormData, setGoalFormData] = useState({
        name: '',
        emoji: '🎯',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null);
    const [addAmount, setAddAmount] = useState('');

    useSEO({
        title: 'Finance Tracker - Dashboard | BookBriefs',
        description: 'Professional finance dashboard. Track income and expenses with beautiful charts.',
        keywords: 'finance tracker, dashboard, expense tracker, charts, budget',
        type: 'website',
    });

    // Load transactions from Firestore
    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const txnQuery = query(
            collection(db, 'users', currentUser.uid, 'transactions'),
            orderBy('date', 'desc')
        );

        const goalQuery = query(
            collection(db, 'users', currentUser.uid, 'goals'),
            orderBy('createdAt', 'desc')
        );

        const unsubTxn = onSnapshot(txnQuery, (snapshot) => {
            const txns: Transaction[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Transaction[];
            setTransactions(txns);
            setIsLoading(false);
        });

        const unsubGoals = onSnapshot(goalQuery, (snapshot) => {
            const g: Goal[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Goal[];
            setGoals(g);
        });

        return () => {
            unsubTxn();
            unsubGoals();
        };
    }, [currentUser]);

    // Filter transactions by selected month
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const txnMonth = t.date.substring(0, 7);
            return selectedMonth === 'all' || txnMonth === selectedMonth;
        });
    }, [transactions, selectedMonth]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const totalIncome = filteredTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = filteredTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        return { totalIncome, totalExpenses, balance };
    }, [filteredTransactions]);

    // Monthly chart data (last 12 months)
    const monthlyChartData = useMemo(() => {
        const months: Record<string, { month: string; Income: number; Expenses: number }> = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months[key] = { month: d.toLocaleDateString('en-US', { month: 'short' }), Income: 0, Expenses: 0 };
        }
        transactions.forEach((t) => {
            const key = t.date.substring(0, 7);
            if (months[key]) {
                if (t.type === 'income') months[key].Income += t.amount;
                else months[key].Expenses += t.amount;
            }
        });
        return Object.values(months);
    }, [transactions]);

    // Category breakdown for pie chart
    const pieChartData = useMemo(() => {
        const breakdown: Record<string, number> = {};
        filteredTransactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
                breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
            });
        return Object.entries(breakdown)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [filteredTransactions]);

    // Get unique months
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach((t) => months.add(t.date.substring(0, 7)));
        return Array.from(months).sort().reverse();
    }, [transactions]);

    const savingsRate = useMemo(() => {
        if (stats.totalIncome <= 0) return 0;
        return Math.round((stats.balance / stats.totalIncome) * 100);
    }, [stats.balance, stats.totalIncome]);

    const periodLabel = useMemo(() => {
        if (selectedMonth === 'all') return 'All time';
        return new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, [selectedMonth]);

    const topExpenseCategory = pieChartData[0]?.name || 'No category yet';
    const totalGoalProgress = useMemo(() => {
        if (goals.length === 0) return 0;
        const targetTotal = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const currentTotal = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        return targetTotal > 0 ? Math.min(Math.round((currentTotal / targetTotal) * 100), 100) : 0;
    }, [goals]);

    // Export CSV
    const handleExportCSV = () => {
        const reportDate = new Date().toLocaleDateString();
        const period = selectedMonth === 'all' ? 'All Time' : new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        const summaryRows = [
            ['BookBriefs Finance Report'],
            ['Generated On', reportDate],
            ['Period', period],
            [''],
            ['SUMMARY'],
            ['Total Income', `$${stats.totalIncome.toFixed(2)}`],
            ['Total Expenses', `$${stats.totalExpenses.toFixed(2)}`],
            ['Net Balance', `$${stats.balance.toFixed(2)}`],
            [''],
            ['TRANSACTIONS']
        ];
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const rows = filteredTransactions.map((t) => [
            t.date,
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            t.category,
            `"${t.description.replace(/"/g, '""')}"`,
            t.amount.toFixed(2),
        ]);
        const csvContent = [...summaryRows.map(r => r.join(',')), headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BookBriefs_Finance_Report_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle scanned receipt
    const handleScanComplete = async (data: { date: string; amount: string; description: string; category: string }) => {
        if (!currentUser) return;

        try {
            // Sanitize amount (replace comma with dot for international formats)
            const cleanAmount = data.amount.replace(/,/g, '.');
            const numericAmount = parseFloat(cleanAmount);

            if (isNaN(numericAmount)) {
                alert('Invalid amount format.');
                return;
            }

            await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
                date: data.date,
                description: data.description || 'Scanned Receipt',
                category: data.category || 'Other', // Default to 'Other' if not matching
                amount: numericAmount,
                type: 'expense',
                createdAt: Timestamp.now(),
            });

            // Success feedback
            // console.log('Transaction added successfully');
        } catch (error: any) {
            console.error('Error adding scanned transaction:', error);
            alert(`Failed to save transaction: ${error.message}`);
        }
    };

    // Handle transaction form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
                date: formData.date,
                description: formData.description,
                category: formData.category,
                amount: parseFloat(formData.amount),
                type: formData.type,
                createdAt: Timestamp.now(),
            });
            setFormData({ date: new Date().toISOString().split('T')[0], description: '', category: '', amount: '', type: 'expense' });
            setShowForm(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle goal form submission
    const handleGoalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'goals'), {
                name: goalFormData.name,
                emoji: goalFormData.emoji,
                targetAmount: parseFloat(goalFormData.targetAmount),
                currentAmount: parseFloat(goalFormData.currentAmount) || 0,
                targetDate: goalFormData.targetDate,
                createdAt: Timestamp.now(),
            });
            setGoalFormData({ name: '', emoji: '🎯', targetAmount: '', currentAmount: '', targetDate: '' });
            setShowGoalForm(false);
        } catch (error) {
            console.error('Error adding goal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add amount to goal
    const handleAddToGoal = async (goalId: string) => {
        if (!currentUser || !addAmount) return;
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'goals', goalId), {
                currentAmount: goal.currentAmount + parseFloat(addAmount),
            });
            setAddAmount('');
            setAddAmountGoalId(null);
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    // Delete goal
    const handleDeleteGoal = async (goalId: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalId));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    // Delete transaction
    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', id));
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    if (!currentUser) {
        return (
            <div className="max-w-3xl mx-auto text-center py-16" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-2xl p-8 border border-orange-200">
                    <svg className="w-16 h-16 mx-auto text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to access your personal finance dashboard.</p>
                    <a href="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F7F9] px-4 py-6 md:py-8" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_26px_rgba(17,24,39,0.06)]">
                            <CalendarDays className="h-4 w-4 text-orange-500" aria-hidden="true" />
                            <span>{periodLabel}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">Finance tracker</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 text-pretty">
                            Track spending, scan receipts, and keep goals visible without leaving your reading workflow.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="min-h-10 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08),0_8px_22px_rgba(17,24,39,0.05)] transition-[box-shadow,background-color] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                            <option value="all">All Time</option>
                            {availableMonths.map((month) => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <ReceiptScanner
                            onScanComplete={handleScanComplete}
                            className="pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08),0_8px_22px_rgba(17,24,39,0.05)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-gray-50"
                            label="Scan receipt"
                        />
                        <button
                            onClick={() => setShowForm(true)}
                            className="pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-bold text-white shadow-[0_1px_2px_rgba(127,29,29,0.12),0_14px_30px_rgba(249,115,22,0.26)] transition-[transform,box-shadow,background-color] duration-200 hover:shadow-[0_1px_2px_rgba(127,29,29,0.12),0_18px_36px_rgba(249,115,22,0.32)]"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add transaction
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[24px] bg-[#E7EBDF] p-5 text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_18px_44px_rgba(71,85,62,0.14)]">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Net balance</span>
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]">
                                <WalletCards className="h-5 w-5 text-gray-800" aria-hidden="true" />
                            </span>
                        </div>
                        <p className={`text-3xl font-bold tabular-nums ${stats.balance < 0 ? 'text-red-600' : 'text-gray-950'}`}>
                            {formatCurrency(stats.balance)}
                        </p>
                        <p className="mt-2 text-xs text-gray-600">Income minus expenses for {periodLabel.toLowerCase()}.</p>
                    </div>

                    <div className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)]">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Income</span>
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-950 tabular-nums">{formatCurrency(stats.totalIncome)}</p>
                        <p className="mt-2 text-xs text-gray-400">{filteredTransactions.filter((t) => t.type === 'income').length} income entries</p>
                    </div>

                    <div className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)]">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Expenses</span>
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-950 tabular-nums">{formatCurrency(stats.totalExpenses)}</p>
                        <p className="mt-2 text-xs text-gray-400">{topExpenseCategory}</p>
                    </div>

                    <div className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)]">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Savings rate</span>
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <TrendingUp className="h-5 w-5" aria-hidden="true" />
                            </span>
                        </div>
                        <p className={`text-3xl font-bold tabular-nums ${savingsRate < 0 ? 'text-red-600' : 'text-gray-950'}`}>{savingsRate}%</p>
                        <p className="mt-2 text-xs text-gray-400">{filteredTransactions.length} transactions tracked</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3 rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] md:p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">Cashflow</h2>
                                <p className="mt-1 text-sm text-gray-500">Income and expenses across the last 12 months.</p>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 tabular-nums">
                                {formatCompactCurrency(stats.balance)}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={290}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 16, left: 0, bottom: 6 }}>
                                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} contentStyle={{ borderRadius: '14px', border: '0', boxShadow: '0 18px 45px rgba(17, 24, 39, 0.14)' }} />
                                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                                <Bar dataKey="Income" fill="#111827" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Expenses" fill="#F97316" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] md:p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">Spending mix</h2>
                                <p className="mt-1 text-sm text-gray-500">Top categories for the selected period.</p>
                            </div>
                            <TrendingDown className="h-5 w-5 text-orange-500" aria-hidden="true" />
                        </div>
                        {pieChartData.length > 0 ? (
                            <>
                                <div className="relative">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={64}
                                                outerRadius={88}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pieChartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '14px', border: '0', boxShadow: '0 18px 45px rgba(17, 24, 39, 0.14)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-gray-400">Spent</p>
                                            <p className="text-xl font-bold text-gray-950 tabular-nums">{formatCurrency(stats.totalExpenses)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {pieChartData.map((item, index) => (
                                        <div key={item.name} className="flex min-h-9 items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                            <span className="truncate text-gray-600">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 text-center">
                                <ReceiptText className="mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
                                <p className="font-semibold text-gray-700">No expense data yet</p>
                                <p className="mt-1 text-sm text-gray-400">Add or scan an expense to see your category mix.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Goals + Transactions Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-4 rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] md:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">Goals</h2>
                                <p className="mt-1 text-sm text-gray-500 tabular-nums">{totalGoalProgress}% funded overall</p>
                            </div>
                            <button
                                onClick={() => setShowGoalForm(true)}
                                className="pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition-[transform,background-color] duration-200 hover:bg-orange-100"
                            >
                                <Target className="h-4 w-4" aria-hidden="true" />
                                New goal
                            </button>
                        </div>
                        <div className="space-y-3">
                            {goals.length === 0 ? (
                                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 text-center">
                                    <Target className="mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
                                    <p className="font-semibold text-gray-700">No goals yet</p>
                                    <p className="mt-1 text-sm text-gray-400">Create a savings target and track progress alongside your spending.</p>
                                </div>
                            ) : (
                                goals.map((goal) => {
                                    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                                    return (
                                        <div key={goal.id} className="group relative rounded-2xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                            <button
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="pressable absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 opacity-0 transition-[opacity,transform,color,background-color] duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                aria-label={`Delete ${goal.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                            <div className="flex items-start justify-between gap-4 pr-8">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{goal.emoji} {goal.name}</p>
                                                    <p className="mt-1 text-xs text-gray-400">Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No date'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(goal.currentAmount)}</p>
                                                    <p className="text-xs text-gray-400 tabular-nums">of {formatCurrency(goal.targetAmount)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-[width] duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                                            </div>
                                            {addAmountGoalId === goal.id ? (
                                                <div className="mt-3 flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={addAmount}
                                                        onChange={(e) => setAddAmount(e.target.value)}
                                                        placeholder="Amount"
                                                        className="min-h-10 flex-1 rounded-xl bg-white px-3 py-2 text-sm shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                    />
                                                    <button onClick={() => handleAddToGoal(goal.id)} className="pressable min-h-10 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-[transform,background-color] duration-200">Add</button>
                                                    <button onClick={() => setAddAmountGoalId(null)} className="pressable min-h-10 rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] transition-[transform,background-color] duration-200">Cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddAmountGoalId(goal.id)}
                                                    className="pressable mt-3 min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-orange-600 transition-[transform,background-color] duration-200 hover:bg-orange-50"
                                                >
                                                    + Add funds
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-8 overflow-hidden rounded-[24px] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)]">
                        <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">Recent transactions</h2>
                                <p className="mt-1 text-sm text-gray-500 tabular-nums">{filteredTransactions.length} entries for {periodLabel.toLowerCase()}</p>
                            </div>
                            <button
                                onClick={handleExportCSV}
                                className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-800"
                                aria-label="Export CSV"
                            >
                                <Download className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        {isLoading ? (
                            <div className="p-10 text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500"></div>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="flex min-h-[340px] flex-col items-center justify-center border-t border-gray-100 px-6 text-center">
                                <ReceiptText className="mb-4 h-10 w-10 text-gray-300" aria-hidden="true" />
                                <p className="text-lg font-semibold text-gray-800">No transactions yet</p>
                                <p className="mt-2 max-w-sm text-sm text-gray-400">Start with one expense or income entry. Your charts and savings rate will update automatically.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="pressable mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:bg-gray-800"
                                >
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                    Add first transaction
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border-t border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Transaction</th>
                                            <th className="hidden px-6 py-3 text-left sm:table-cell">Date</th>
                                            <th className="hidden px-6 py-3 text-left md:table-cell">Category</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                            <th className="px-3 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTransactions.slice(0, 10).map((txn) => (
                                            <tr key={txn.id} className="transition-colors duration-200 hover:bg-gray-50/80">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${txn.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {txn.type === 'income' ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4" aria-hidden="true" />}
                                                        </span>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{txn.description}</p>
                                                            <p className="text-xs text-gray-400 sm:hidden">{new Date(txn.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-6 py-4 text-gray-500 sm:table-cell">{new Date(txn.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td className="hidden px-6 py-4 md:table-cell">
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{txn.category}</span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold tabular-nums ${txn.type === 'income' ? 'text-emerald-600' : 'text-gray-950'}`}>
                                                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <button
                                                        onClick={() => handleDelete(txn.id)}
                                                        className="pressable flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-[transform,background-color,color] duration-200 hover:bg-red-50 hover:text-red-500"
                                                        aria-label={`Delete ${txn.description}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">New Transaction</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense', category: '' })} className={`flex-1 py-2 rounded-lg font-medium transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-600'}`}>
                                    Expense
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'income', category: '' })} className={`flex-1 py-2 rounded-lg font-medium transition-all ${formData.type === 'income' ? 'bg-green-500 text-white' : 'text-gray-600'}`}>
                                    Income
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                <input type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" required>
                                    <option value="">Select category</option>
                                    {CATEGORIES[formData.type].map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., Coffee" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" required />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Save Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Goal Modal */}
            {showGoalForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">New Goal</h2>
                            <button onClick={() => setShowGoalForm(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleGoalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                                <div className="flex flex-wrap gap-2">
                                    {GOAL_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setGoalFormData({ ...goalFormData, emoji })}
                                            className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${goalFormData.emoji === emoji ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                                <input type="text" value={goalFormData.name} onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })} placeholder="e.g., Buying a car" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)</label>
                                    <input type="number" step="0.01" min="1" value={goalFormData.targetAmount} onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })} placeholder="15000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount ($)</label>
                                    <input type="number" step="0.01" min="0" value={goalFormData.currentAmount} onChange={(e) => setGoalFormData({ ...goalFormData, currentAmount: e.target.value })} placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                                <input type="month" value={goalFormData.targetDate} onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Create Goal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceTrackerPage;
