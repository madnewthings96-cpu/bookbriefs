import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../App';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useSEO from '../hooks/useSEO';
import ReceiptScanner from '../components/ReceiptScanner';
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
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 bg-white"
                    >
                        <option value="all">All Time</option>
                        {availableMonths.map((month) => (
                            <option key={month} value={month}>
                                {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <ReceiptScanner onScanComplete={handleScanComplete} />
                    <button
                        onClick={() => setShowForm(true)}
                        className="uiverse-btn"
                    >
                        <span>ADD NEW <span className="text-base text-lg-adjust">+</span></span>
                    </button>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bar Chart - Accounts */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Accounts</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="Income" fill="#1F2937" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Expenses by Category */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Expenses by category</h2>
                    {pieChartData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center -mt-24 mb-16">
                                <p className="text-2xl font-bold text-gray-800">${stats.totalExpenses.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center text-xs">
                                {pieChartData.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-400">No expense data</div>
                    )}
                </div>
            </div>

            {/* Summary Cards + Transactions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Stats & Goals */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Income Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                        <p className="text-gray-500 text-sm">Incomes</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">${stats.totalIncome.toLocaleString()}</p>
                        <p className="text-gray-400 text-xs mt-1">amount of income</p>
                    </div>
                    {/* Expenses Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                        <p className="text-gray-500 text-sm">Expenses</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">${stats.totalExpenses.toLocaleString()}</p>
                        <p className="text-gray-400 text-xs mt-1">amount of expenses</p>
                    </div>
                    {/* Goals Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-gray-500 text-sm font-medium">Goals</p>
                            <button
                                onClick={() => setShowGoalForm(true)}
                                className="text-xs text-orange-500 font-medium border border-orange-200 px-2 py-1 rounded-md hover:bg-orange-50"
                            >
                                NEW GOAL +
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {goals.length === 0 ? (
                                <p className="text-gray-400 text-center py-4 text-sm">No goals yet</p>
                            ) : (
                                goals.map((goal) => {
                                    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                                    return (
                                        <div key={goal.id} className="p-3 bg-gray-50 rounded-lg group relative">
                                            <button
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{goal.emoji} {goal.name}</p>
                                                    <p className="text-xs text-gray-400">Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No date'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Collected <span className="font-semibold text-gray-800">{goal.currentAmount.toLocaleString()}$</span></p>
                                                    <p className="text-xs text-gray-400">Target: {goal.targetAmount.toLocaleString()}$</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                            </div>
                                            {addAmountGoalId === goal.id ? (
                                                <div className="mt-2 flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={addAmount}
                                                        onChange={(e) => setAddAmount(e.target.value)}
                                                        placeholder="Amount"
                                                        className="flex-1 px-2 py-1 border rounded text-xs"
                                                    />
                                                    <button onClick={() => handleAddToGoal(goal.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Add</button>
                                                    <button onClick={() => setAddAmountGoalId(null)} className="px-2 py-1 bg-gray-200 rounded text-xs">Cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddAmountGoalId(goal.id)}
                                                    className="mt-2 text-xs text-orange-500 hover:underline"
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
                </div>

                {/* Right Column - Transactions Table */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Recent transactions</h2>
                            <p className="text-gray-400 text-xs">All your transactions are recorded</p>
                        </div>
                        <button onClick={handleExportCSV} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No transactions found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Transactions</th>
                                        <th className="px-6 py-3 text-left hidden sm:table-cell">Transaction date</th>
                                        <th className="px-6 py-3 text-left hidden md:table-cell">Category</th>
                                        <th className="px-6 py-3 text-left hidden lg:table-cell">Status</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-2 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTransactions.slice(0, 10).map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">{txn.description}</td>
                                            <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{new Date(txn.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{txn.category}</td>
                                            <td className="px-6 py-4 hidden lg:table-cell"><span className="text-emerald-500 font-medium">Success</span></td>
                                            <td className={`px-6 py-4 text-right font-semibold ${txn.type === 'income' ? 'text-emerald-500' : 'text-gray-800'}`}>
                                                {txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString()}$
                                            </td>
                                            <td className="px-2 py-4">
                                                <button onClick={() => handleDelete(txn.id)} className="text-gray-300 hover:text-red-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

            {/* Ko-fi Support Button */}
            <div className="mt-8 flex justify-center">
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
