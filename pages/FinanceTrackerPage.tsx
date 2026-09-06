import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFirebase } from '../App';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useSEO from '../hooks/useSEO';
import ReceiptScanner from '../components/ReceiptScanner';
import './FinanceTrackerPage.css';
import {
    ArrowDownRight,
    ArrowRight,
    Leaf,
    Check,
    ArrowUpRight,
    CalendarDays,
    Download,
    Edit3,
    PiggyBank,
    Plus,
    ReceiptText,
    Search,
    SlidersHorizontal,
    Target,
    Trash2,
    TrendingDown,
    TrendingUp,
    WalletCards,
    X,
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

interface Budget {
    id: string;
    category: string;
    amount: number;
    updatedAt?: Timestamp;
}

type TransactionTypeFilter = 'all' | 'income' | 'expense';
type TransactionSort = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type FinanceLanguage = 'en' | 'ar';

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other Income'],
    expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other'],
};

const PIE_COLORS = ['#2F6B53', '#C49552', '#7D9B89', '#71889A', '#B87965', '#A79F82'];
const GOAL_EMOJIS = ['🚗', '🏖️', '🏠', '💻', '📱', '🎓', '💍', '🎸', '🏋️', '✈️'];

const CATEGORY_LABELS: Record<FinanceLanguage, Record<string, string>> = {
    en: {},
    ar: {
        Salary: 'الراتب',
        Freelance: 'العمل الحر',
        Investments: 'الاستثمارات',
        Gift: 'هدية',
        'Other Income': 'دخل آخر',
        Food: 'الطعام',
        Transport: 'المواصلات',
        Housing: 'السكن',
        Entertainment: 'الترفيه',
        Shopping: 'التسوق',
        Utilities: 'الفواتير',
        Healthcare: 'الصحة',
        Other: 'أخرى',
    },
};

const FINANCE_COPY = {
    en: {
        allTime: 'All Time',
        allTimeSentence: 'All time',
        currentMonth: 'Current month',
        language: 'Language',
        english: 'English',
        arabic: 'العربية',
        financeTracker: 'Finance tracker',
        headerDescription: 'A clearer view of today. A little more room for tomorrow.',
        headline: 'Money, with intention.',
        workspace: 'YOUR PERSONAL LEDGER',
        overview: 'Overview',
        reportingPeriod: 'Reporting period',
        dashboardNavigation: 'Finance sections',
        balanceNote: 'A snapshot of what came in and what went out.',
        currency: 'USD · US dollar',
        savingsHelp: 'The share of your income you kept.',
        firstSteps: 'Small steps. A clearer picture.',
        firstStepsHelp: 'Start with what came in, then give every dollar a direction.',
        yourNextChapter: 'What are you saving for?',
        goalInvitation: 'A little set aside today. Something to look forward to tomorrow.',
        createFirstGoal: 'Set your first goal',
        activityEmpty: 'Your story starts with one entry.',
        activityEmptyHelp: 'A coffee, a paycheck, a fresh start. Add your first transaction to see your money in perspective.',
        cashflowEmpty: 'Your cashflow story is taking shape.',
        cashflowEmptyHelp: 'Add income or expenses to see the last 12 months here.',
        scanReceipt: 'Scan receipt',
        addTransaction: 'Add transaction',
        netBalance: 'Net balance',
        netBalanceHelp: 'Income minus expenses for {period}.',
        income: 'Income',
        expenses: 'Expenses',
        savingsRate: 'Savings rate',
        incomeEntries: '{count} income entries',
        addIncomeToTrackSavings: 'Add income to track savings',
        addExpensesToBuildCategories: 'Add expenses to build categories',
        transactionsTracked: '{count} transactions tracked',
        addTransactionsToCalculateRate: 'Add transactions to calculate rate',
        startPeriod: 'Start {period}',
        onboardingTitle: 'Turn this empty month into a useful ledger.',
        onboardingBody: 'Add one income source and one expense to unlock meaningful trends for this period.',
        addIncome: 'Add income',
        addIncomeHelp: 'Salary, freelance, dividends, or gifts.',
        logExpense: 'Log expense',
        logExpenseHelp: 'Capture the first spend for this month.',
        setBudget: 'Set a budget',
        setBudgetHelp: 'Pick a category below and save a limit.',
        insights: 'Insights',
        insightsReady: 'Spending momentum for the selected period.',
        insightsEmpty: 'Insights appear once this period has expense data.',
        averageDailySpend: 'Average daily spend',
        projectedSpend: 'Projected spend',
        vsLastMonth: 'Vs last month',
        topCategory: 'Top category',
        biggestIncrease: 'Biggest increase',
        waitingForExpenses: 'Waiting for expenses',
        noProjectionYet: 'No projection yet',
        noBaseline: 'No baseline',
        needsPriorMonthSpend: 'Needs prior-month spend',
        addExpenseFirst: 'Add an expense first',
        noneYet: 'None yet',
        daysLeft: '{count} days left',
        acrossTrackedDays: 'Across tracked days',
        allTrackedSpend: 'All tracked spend',
        atCurrentPace: 'At current pace',
        previousAmount: '{amount} previous',
        higher: '{amount} higher',
        categoryBudgets: 'Category budgets',
        budgetSummary: '{period}: {spent} spent of {budget} planned.',
        remaining: 'Remaining',
        used: 'Used',
        alerts: 'Alerts',
        budgetCategory: 'Budget category',
        limit: 'Limit',
        save: 'Save',
        noBudgetsYet: 'No budgets yet',
        noBudgetsHelp: 'Set a monthly limit for a category and it will track automatically against your expenses.',
        spentOf: '{spent} spent of {budget}',
        spentWithoutBudget: '{spent} spent without a set budget',
        unset: 'Unset',
        deleteBudget: 'Delete {category} budget',
        overBudget: '{amount} over budget',
        remainingAmount: '{amount} remaining',
        setLimitToTrack: 'Set a limit to start tracking this category.',
        goals: 'Goals',
        fundedOverall: '{percent}% funded overall',
        newGoal: 'New goal',
        noGoalsYet: 'No goals yet',
        noGoalsHelp: 'Create a savings target and track progress alongside your spending.',
        target: 'Target',
        noDate: 'No date',
        of: 'of',
        perMonthNeeded: '{amount} per month needed',
        leftToFund: '{amount} left to fund',
        addFunds: '+ Add funds',
        add: 'Add',
        cancel: 'Cancel',
        amount: 'Amount',
        transactions: 'Transactions',
        entriesForPeriod: '{visible} of {total} entries for {period}',
        clear: 'Clear',
        exportCsv: 'Export CSV',
        searchTransactions: 'Search transactions',
        searchPlaceholder: 'Search description, category, amount',
        allTypes: 'All types',
        allCategories: 'All categories',
        newestFirst: 'Newest first',
        oldestFirst: 'Oldest first',
        largestAmount: 'Largest amount',
        smallestAmount: 'Smallest amount',
        noTransactionsYet: 'No transactions yet',
        noTransactionsHelp: 'Start with one expense or income entry. Your charts and savings rate will update automatically.',
        addFirstTransaction: 'Add first transaction',
        noMatchingTransactions: 'No matching transactions',
        noMatchingHelp: 'Adjust your filters or clear them to return to the full list for this period.',
        clearFilters: 'Clear filters',
        transaction: 'Transaction',
        date: 'Date',
        category: 'Category',
        description: 'Description',
        amountColumn: 'Amount',
        edit: 'Edit {description}',
        delete: 'Delete {description}',
        showLatest10: 'Show latest 10',
        showAll: 'Show all {count}',
        cashflowHistory: '12-month cashflow history',
        cashflowHelp: 'Income and expenses across the last 12 calendar months.',
        spendingMix: 'Spending mix',
        spendingMixHelp: 'Top categories for the selected period.',
        spent: 'Spent',
        noExpenseData: 'No expense data yet',
        noExpenseDataHelp: 'Add or scan an expense to see your category mix.',
        signInRequired: 'Sign In Required',
        signInMessage: 'Please log in to access your personal finance dashboard.',
        signIn: 'Sign In',
        editTransaction: 'Edit Transaction',
        newTransaction: 'New Transaction',
        closeTransactionForm: 'Close transaction form',
        expense: 'Expense',
        amountUsd: 'Amount ($)',
        selectCategory: 'Select category',
        coffeeExample: 'e.g., Coffee',
        saving: 'Saving...',
        saveTransaction: 'Save Transaction',
        updateTransaction: 'Update Transaction',
        closeGoalForm: 'Close goal form',
        emoji: 'Emoji',
        goalName: 'Goal Name',
        goalPlaceholder: 'e.g., Buying a car',
        targetAmountUsd: 'Target Amount ($)',
        currentAmountUsd: 'Current Amount ($)',
        targetDate: 'Target Date',
        createGoal: 'Create Goal',
        invalidAmount: 'Invalid amount format.',
        scannedReceipt: 'Scanned Receipt',
        failedToSave: 'Failed to save transaction: {message}',
    },
    ar: {
        allTime: 'كل الفترات',
        allTimeSentence: 'كل الفترات',
        currentMonth: 'الشهر الحالي',
        language: 'اللغة',
        english: 'English',
        arabic: 'العربية',
        financeTracker: 'متتبع المال',
        headerDescription: 'رؤية أوضح لليوم. ومساحة أكبر للغد.',
        headline: 'أموالك، بوعي.',
        workspace: 'سجلك المالي الشخصي',
        overview: 'نظرة عامة',
        reportingPeriod: 'الفترة المالية',
        dashboardNavigation: 'أقسام المال',
        balanceNote: 'نظرة على ما كسبته وما أنفقته.',
        currency: 'USD · دولار أمريكي',
        savingsHelp: 'نسبة الدخل التي احتفظت بها.',
        firstSteps: 'خطوات صغيرة. صورة أوضح.',
        firstStepsHelp: 'ابدأ بما كسبته، ثم حدد وجهة كل دولار.',
        yourNextChapter: 'لأي حلم تدّخر؟',
        goalInvitation: 'القليل اليوم. وشيء تتطلع إليه غداً.',
        createFirstGoal: 'حدد هدفك الأول',
        activityEmpty: 'تبدأ قصتك بمعاملة واحدة.',
        activityEmptyHelp: 'قهوة، راتب، أو بداية جديدة. أضف أول معاملة لترى أموالك بصورة أوضح.',
        cashflowEmpty: 'قصة أموالك تتشكل.',
        cashflowEmptyHelp: 'أضف دخلاً أو مصروفاً لترى آخر 12 شهراً هنا.',
        scanReceipt: 'مسح إيصال',
        addTransaction: 'إضافة معاملة',
        netBalance: 'صافي الرصيد',
        netBalanceHelp: 'الدخل ناقص المصروفات خلال {period}.',
        income: 'الدخل',
        expenses: 'المصروفات',
        savingsRate: 'معدل الادخار',
        incomeEntries: '{count} إدخالات دخل',
        addIncomeToTrackSavings: 'أضف دخلاً لحساب الادخار',
        addExpensesToBuildCategories: 'أضف مصروفات لبناء التصنيفات',
        transactionsTracked: '{count} معاملات مسجلة',
        addTransactionsToCalculateRate: 'أضف معاملات لحساب المعدل',
        startPeriod: 'ابدأ {period}',
        onboardingTitle: 'حوّل هذا الشهر الفارغ إلى سجل مالي مفيد.',
        onboardingBody: 'أضف مصدر دخل ومصروفاً واحداً لتظهر المؤشرات لهذه الفترة.',
        addIncome: 'أضف دخل',
        addIncomeHelp: 'راتب أو عمل حر أو أرباح أو هدية.',
        logExpense: 'سجل مصروف',
        logExpenseHelp: 'سجل أول مصروف لهذه الفترة.',
        setBudget: 'حدد ميزانية',
        setBudgetHelp: 'اختر تصنيفاً بالأسفل واحفظ حد الإنفاق.',
        insights: 'المؤشرات',
        insightsReady: 'قراءة سريعة لاتجاه المصروفات في الفترة المحددة.',
        insightsEmpty: 'تظهر المؤشرات بعد إضافة مصروفات لهذه الفترة.',
        averageDailySpend: 'متوسط الصرف اليومي',
        projectedSpend: 'الصرف المتوقع',
        vsLastMonth: 'مقارنة بالشهر السابق',
        topCategory: 'أعلى تصنيف',
        biggestIncrease: 'أكبر زيادة',
        waitingForExpenses: 'بانتظار المصروفات',
        noProjectionYet: 'لا يوجد توقع بعد',
        noBaseline: 'لا يوجد أساس مقارنة',
        needsPriorMonthSpend: 'يحتاج مصروفات من الشهر السابق',
        addExpenseFirst: 'أضف مصروفاً أولاً',
        noneYet: 'لا شيء بعد',
        daysLeft: '{count} أيام متبقية',
        acrossTrackedDays: 'عبر الأيام المسجلة',
        allTrackedSpend: 'كل المصروفات المسجلة',
        atCurrentPace: 'حسب الوتيرة الحالية',
        previousAmount: '{amount} سابقاً',
        higher: '{amount} أعلى',
        categoryBudgets: 'ميزانيات التصنيفات',
        budgetSummary: '{period}: تم صرف {spent} من {budget} المخطط.',
        remaining: 'المتبقي',
        used: 'المستخدم',
        alerts: 'تنبيهات',
        budgetCategory: 'تصنيف الميزانية',
        limit: 'الحد',
        save: 'حفظ',
        noBudgetsYet: 'لا توجد ميزانيات بعد',
        noBudgetsHelp: 'حدد حداً شهرياً لتصنيف وسيتم تتبعه تلقائياً مقابل مصروفاتك.',
        spentOf: '{spent} مصروف من {budget}',
        spentWithoutBudget: '{spent} مصروف بدون ميزانية محددة',
        unset: 'غير محدد',
        deleteBudget: 'حذف ميزانية {category}',
        overBudget: '{amount} فوق الميزانية',
        remainingAmount: '{amount} متبقي',
        setLimitToTrack: 'حدد حداً لبدء تتبع هذا التصنيف.',
        goals: 'الأهداف',
        fundedOverall: '{percent}% ممول إجمالاً',
        newGoal: 'هدف جديد',
        noGoalsYet: 'لا توجد أهداف بعد',
        noGoalsHelp: 'أنشئ هدف ادخار وتابع تقدمه بجانب مصروفاتك.',
        target: 'الهدف',
        noDate: 'بدون تاريخ',
        of: 'من',
        perMonthNeeded: '{amount} شهرياً مطلوب',
        leftToFund: '{amount} متبقي للتمويل',
        addFunds: '+ إضافة مبلغ',
        add: 'إضافة',
        cancel: 'إلغاء',
        amount: 'المبلغ',
        transactions: 'المعاملات',
        entriesForPeriod: '{visible} من {total} معاملات لـ {period}',
        clear: 'مسح',
        exportCsv: 'تصدير CSV',
        searchTransactions: 'بحث في المعاملات',
        searchPlaceholder: 'ابحث بالوصف أو التصنيف أو المبلغ',
        allTypes: 'كل الأنواع',
        allCategories: 'كل التصنيفات',
        newestFirst: 'الأحدث أولاً',
        oldestFirst: 'الأقدم أولاً',
        largestAmount: 'الأكبر مبلغاً',
        smallestAmount: 'الأصغر مبلغاً',
        noTransactionsYet: 'لا توجد معاملات بعد',
        noTransactionsHelp: 'ابدأ بإدخال دخل أو مصروف واحد. ستتحدث الرسوم ومعدل الادخار تلقائياً.',
        addFirstTransaction: 'أضف أول معاملة',
        noMatchingTransactions: 'لا توجد معاملات مطابقة',
        noMatchingHelp: 'عدّل الفلاتر أو امسحها للعودة إلى القائمة الكاملة لهذه الفترة.',
        clearFilters: 'مسح الفلاتر',
        transaction: 'المعاملة',
        date: 'التاريخ',
        category: 'التصنيف',
        description: 'الوصف',
        amountColumn: 'المبلغ',
        edit: 'تعديل {description}',
        delete: 'حذف {description}',
        showLatest10: 'إظهار آخر 10',
        showAll: 'إظهار الكل {count}',
        cashflowHistory: 'تاريخ التدفق النقدي خلال 12 شهراً',
        cashflowHelp: 'الدخل والمصروفات خلال آخر 12 شهراً.',
        spendingMix: 'توزيع المصروفات',
        spendingMixHelp: 'أعلى التصنيفات في الفترة المحددة.',
        spent: 'مصروف',
        noExpenseData: 'لا توجد بيانات مصروفات بعد',
        noExpenseDataHelp: 'أضف أو امسح مصروفاً لرؤية توزيع التصنيفات.',
        signInRequired: 'تسجيل الدخول مطلوب',
        signInMessage: 'يرجى تسجيل الدخول للوصول إلى لوحة المال الشخصية.',
        signIn: 'تسجيل الدخول',
        editTransaction: 'تعديل المعاملة',
        newTransaction: 'معاملة جديدة',
        closeTransactionForm: 'إغلاق نموذج المعاملة',
        expense: 'مصروف',
        amountUsd: 'المبلغ ($)',
        selectCategory: 'اختر التصنيف',
        coffeeExample: 'مثال: قهوة',
        saving: 'جاري الحفظ...',
        saveTransaction: 'حفظ المعاملة',
        updateTransaction: 'تحديث المعاملة',
        closeGoalForm: 'إغلاق نموذج الهدف',
        emoji: 'رمز',
        goalName: 'اسم الهدف',
        goalPlaceholder: 'مثال: شراء سيارة',
        targetAmountUsd: 'مبلغ الهدف ($)',
        currentAmountUsd: 'المبلغ الحالي ($)',
        targetDate: 'تاريخ الهدف',
        createGoal: 'إنشاء الهدف',
        invalidAmount: 'صيغة المبلغ غير صحيحة.',
        scannedReceipt: 'إيصال ممسوح',
        failedToSave: 'فشل حفظ المعاملة: {message}',
    },
} as const;

const getMonthKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const parseLocalDate = (date: string) => new Date(`${date}T00:00:00`);

const localeForLanguage = (language: FinanceLanguage) => language === 'ar' ? 'ar-MA' : 'en-US';

const formatCopy = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

const getCategoryLabel = (category: string, language: FinanceLanguage) =>
    CATEGORY_LABELS[language][category] || category;

const formatMonthLabel = (monthKey: string, language: FinanceLanguage = 'en') =>
    parseLocalDate(`${monthKey}-01`).toLocaleDateString(localeForLanguage(language), {
        month: 'long',
        year: 'numeric',
    });

const getPreviousMonthKey = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    return getMonthKey(new Date(year, month - 2, 1));
};

const getDaysInMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
};

const getMonthsUntil = (targetDate: string) => {
    if (!targetDate) return null;
    const [year, month] = targetDate.split('-').map(Number);
    if (!year || !month) return null;
    const now = new Date();
    const monthDelta = (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
    return Math.max(monthDelta + 1, 1);
};

const formatCurrency = (value: number, language: FinanceLanguage = 'en') =>
    new Intl.NumberFormat(localeForLanguage(language), {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);

const formatCompactCurrency = (value: number, language: FinanceLanguage = 'en') =>
    new Intl.NumberFormat(localeForLanguage(language), {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);

const formatDateLabel = (date: string, language: FinanceLanguage = 'en') =>
    parseLocalDate(date).toLocaleDateString(localeForLanguage(language), {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const FinanceTrackerPage: React.FC = () => {
    const { currentUser } = useFirebase();
    const currentMonthKey = useMemo(() => getMonthKey(new Date()), []);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
    const [transactionSearch, setTransactionSearch] = useState('');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionTypeFilter>('all');
    const [transactionCategoryFilter, setTransactionCategoryFilter] = useState('all');
    const [transactionSort, setTransactionSort] = useState<TransactionSort>('date-desc');
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [financeLanguage, setFinanceLanguage] = useState<FinanceLanguage>(() => {
        if (typeof window === 'undefined') return 'en';
        return window.localStorage.getItem('bookbriefs_finance_language') === 'ar' ? 'ar' : 'en';
    });

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
    const [budgetFormData, setBudgetFormData] = useState({
        category: CATEGORIES.expense[0],
        amount: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null);
    const [addAmount, setAddAmount] = useState('');
    const t = FINANCE_COPY[financeLanguage];
    const isArabic = financeLanguage === 'ar';
    const direction = isArabic ? 'rtl' : 'ltr';
    const textStartClass = isArabic ? 'text-right' : 'text-left';
    const textEndClass = isArabic ? 'text-left' : 'text-right';
    const money = (value: number) => formatCurrency(value, financeLanguage);
    const compactMoney = (value: number) => formatCompactCurrency(value, financeLanguage);
    const monthLabel = (month: string) => formatMonthLabel(month, financeLanguage);
    const dateLabel = (date: string) => formatDateLabel(date, financeLanguage);
    const categoryLabel = (category: string) => getCategoryLabel(category, financeLanguage);

    const changeFinanceLanguage = (language: FinanceLanguage) => {
        setFinanceLanguage(language);
        window.localStorage.setItem('bookbriefs_finance_language', language);
    };

    useSEO({
        title: 'Finance Tracker - Dashboard | BookBriefs',
        description: 'Professional finance dashboard. Track income, expenses, budgets, and savings goals with beautiful charts.',
        keywords: 'finance tracker, dashboard, expense tracker, charts, budget',
        type: 'website',
    });

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

        const budgetQuery = query(
            collection(db, 'users', currentUser.uid, 'budgets'),
            orderBy('category', 'asc')
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

        const unsubBudgets = onSnapshot(budgetQuery, (snapshot) => {
            const b: Budget[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Budget[];
            setBudgets(b);
        });

        return () => {
            unsubTxn();
            unsubGoals();
            unsubBudgets();
        };
    }, [currentUser]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const txnMonth = t.date.substring(0, 7);
            return selectedMonth === 'all' || txnMonth === selectedMonth;
        });
    }, [transactions, selectedMonth]);

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

    const monthlyChartData = useMemo(() => {
        const months: Record<string, { month: string; Income: number; Expenses: number }> = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = getMonthKey(d);
            months[key] = { month: d.toLocaleDateString(localeForLanguage(financeLanguage), { month: 'short' }), Income: 0, Expenses: 0 };
        }
        transactions.forEach((t) => {
            const key = t.date.substring(0, 7);
            if (months[key]) {
                if (t.type === 'income') months[key].Income += t.amount;
                else months[key].Expenses += t.amount;
            }
        });
        return Object.values(months);
    }, [financeLanguage, transactions]);

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

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach((t) => months.add(t.date.substring(0, 7)));
        return Array.from(months).sort().reverse();
    }, [transactions]);

    const monthOptions = useMemo(() => {
        return Array.from(new Set([currentMonthKey, ...availableMonths])).sort().reverse();
    }, [availableMonths, currentMonthKey]);

    const allCategoryOptions = useMemo(() => {
        return Array.from(new Set([...CATEGORIES.expense, ...CATEGORIES.income]));
    }, []);

    const transactionCategoryOptions = useMemo(() => {
        if (transactionTypeFilter === 'income') return CATEGORIES.income;
        if (transactionTypeFilter === 'expense') return CATEGORIES.expense;
        return allCategoryOptions;
    }, [allCategoryOptions, transactionTypeFilter]);

    const visibleTransactions = useMemo(() => {
        const searchTerm = transactionSearch.trim().toLowerCase();
        return filteredTransactions
            .filter((txn) => {
                const matchesSearch = !searchTerm ||
                    txn.description.toLowerCase().includes(searchTerm) ||
                    txn.category.toLowerCase().includes(searchTerm) ||
                    txn.amount.toString().includes(searchTerm);
                const matchesType = transactionTypeFilter === 'all' || txn.type === transactionTypeFilter;
                const matchesCategory = transactionCategoryFilter === 'all' || txn.category === transactionCategoryFilter;
                return matchesSearch && matchesType && matchesCategory;
            })
            .sort((a, b) => {
                if (transactionSort === 'date-asc') return a.date.localeCompare(b.date);
                if (transactionSort === 'amount-desc') return b.amount - a.amount;
                if (transactionSort === 'amount-asc') return a.amount - b.amount;
                return b.date.localeCompare(a.date);
            });
    }, [filteredTransactions, transactionCategoryFilter, transactionSearch, transactionSort, transactionTypeFilter]);

    const transactionsToRender = showAllTransactions ? visibleTransactions : visibleTransactions.slice(0, 10);

    const savingsRate = useMemo(() => {
        if (stats.totalIncome <= 0) return 0;
        return Math.round((stats.balance / stats.totalIncome) * 100);
    }, [stats.balance, stats.totalIncome]);

    const periodLabel = useMemo(() => {
        if (selectedMonth === 'all') return t.allTimeSentence;
        return formatMonthLabel(selectedMonth, financeLanguage);
    }, [financeLanguage, selectedMonth, t.allTimeSentence]);

    const topExpenseCategory = pieChartData[0]?.name || 'No category yet';
    const totalGoalProgress = useMemo(() => {
        if (goals.length === 0) return 0;
        const targetTotal = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const currentTotal = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        return targetTotal > 0 ? Math.min(Math.round((currentTotal / targetTotal) * 100), 100) : 0;
    }, [goals]);

    const budgetMonth = selectedMonth === 'all' ? currentMonthKey : selectedMonth;
    const budgetPeriodLabel = selectedMonth === 'all' ? t.currentMonth : monthLabel(budgetMonth);

    const budgetTransactions = useMemo(() => {
        return transactions.filter((t) => t.date.substring(0, 7) === budgetMonth);
    }, [budgetMonth, transactions]);

    const budgetRows = useMemo(() => {
        const expenseByCategory = budgetTransactions
            .filter((t) => t.type === 'expense')
            .reduce<Record<string, number>>((acc, txn) => {
                acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
                return acc;
            }, {});

        return CATEGORIES.expense.map((category) => {
            const budget = budgets.find((item) => item.category === category);
            const amount = budget?.amount || 0;
            const spent = expenseByCategory[category] || 0;
            const remaining = amount - spent;
            const progress = amount > 0 ? Math.round((spent / amount) * 100) : 0;
            return {
                category,
                amount,
                spent,
                remaining,
                progress,
                hasBudget: amount > 0,
            };
        });
    }, [budgetTransactions, budgets]);

    const activeBudgetRows = useMemo(() => {
        return budgetRows
            .filter((row) => row.hasBudget || row.spent > 0)
            .sort((a, b) => {
                if (a.hasBudget !== b.hasBudget) return a.hasBudget ? -1 : 1;
                return b.spent - a.spent;
            });
    }, [budgetRows]);

    const budgetSummary = useMemo(() => {
        const totalBudget = budgetRows.reduce((sum, row) => sum + row.amount, 0);
        const totalSpent = budgetRows.reduce((sum, row) => sum + row.spent, 0);
        const overBudgetCount = budgetRows.filter((row) => row.hasBudget && row.spent > row.amount).length;
        const progress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        return {
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            progress,
            overBudgetCount,
            categoriesSet: budgetRows.filter((row) => row.hasBudget).length,
        };
    }, [budgetRows]);

    const insightData = useMemo(() => {
        const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');
        const expenseByCategory = expenseTransactions.reduce<Record<string, number>>((acc, txn) => {
            acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
            return acc;
        }, {});

        const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];

        let elapsedDays = 1;
        let totalDays = 1;
        let daysLeft: number | null = null;

        if (selectedMonth === 'all') {
            const sortedDates = filteredTransactions.map((t) => t.date).sort();
            if (sortedDates.length > 0) {
                const start = parseLocalDate(sortedDates[0]).getTime();
                const end = parseLocalDate(sortedDates[sortedDates.length - 1]).getTime();
                elapsedDays = Math.max(Math.ceil((end - start) / 86400000) + 1, 1);
            }
            totalDays = elapsedDays;
        } else {
            totalDays = getDaysInMonth(selectedMonth);
            const today = new Date();
            elapsedDays = selectedMonth === currentMonthKey ? Math.min(today.getDate(), totalDays) : totalDays;
            daysLeft = Math.max(totalDays - elapsedDays, 0);
        }

        const averageDailySpend = stats.totalExpenses / Math.max(elapsedDays, 1);
        const projectedSpend = selectedMonth === 'all' ? stats.totalExpenses : averageDailySpend * totalDays;
        const previousMonthKey = selectedMonth === 'all' ? null : getPreviousMonthKey(selectedMonth);
        const previousExpenses = previousMonthKey
            ? transactions
                .filter((txn) => txn.date.substring(0, 7) === previousMonthKey && txn.type === 'expense')
                .reduce((sum, txn) => sum + txn.amount, 0)
            : null;

        const previousExpenseByCategory = previousMonthKey
            ? transactions
                .filter((txn) => txn.date.substring(0, 7) === previousMonthKey && txn.type === 'expense')
                .reduce<Record<string, number>>((acc, txn) => {
                    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
                    return acc;
                }, {})
            : {};

        const categoryTrend = Object.entries(expenseByCategory)
            .map(([category, amount]) => ({
                category,
                delta: amount - (previousExpenseByCategory[category] || 0),
            }))
            .sort((a, b) => b.delta - a.delta)[0];

        const expenseChangePercent = previousExpenses && previousExpenses > 0
            ? Math.round(((stats.totalExpenses - previousExpenses) / previousExpenses) * 100)
            : null;

        return {
            averageDailySpend,
            projectedSpend,
            daysLeft,
            previousExpenses,
            expenseChangePercent,
            topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
            categoryTrend: categoryTrend && categoryTrend.delta > 0 ? categoryTrend : null,
        };
    }, [currentMonthKey, filteredTransactions, selectedMonth, stats.totalExpenses, transactions]);

    const hasActiveTransactionFilters =
        transactionSearch.trim().length > 0 ||
        transactionTypeFilter !== 'all' ||
        transactionCategoryFilter !== 'all' ||
        transactionSort !== 'date-desc';
    const hasSelectedPeriodTransactions = filteredTransactions.length > 0;
    const hasSelectedPeriodExpenses = stats.totalExpenses > 0;
    const hasSelectedPeriodIncome = stats.totalIncome > 0;
    const hasExpenseComparison = insightData.expenseChangePercent !== null;

    const resetTransactionForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: '',
            amount: '',
            type: 'expense',
        });
    };

    const openAddTransaction = (type: 'income' | 'expense' = 'expense') => {
        setEditingTransactionId(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: '',
            amount: '',
            type,
        });
        setShowForm(true);
    };

    const openEditTransaction = (transaction: Transaction) => {
        setEditingTransactionId(transaction.id);
        setFormData({
            date: transaction.date,
            description: transaction.description,
            category: transaction.category,
            amount: String(transaction.amount),
            type: transaction.type,
        });
        setShowForm(true);
    };

    const closeTransactionForm = () => {
        setShowForm(false);
        setEditingTransactionId(null);
        resetTransactionForm();
    };

    useEffect(() => {
        if (!showForm && !showGoalForm) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        const dialog = dialogRef.current;
        const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex="0"]') || []);
        focusable()[0]?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showForm) closeTransactionForm();
                else setShowGoalForm(false);
            }
            if (event.key !== 'Tab') return;
            const items = focusable();
            const first = items[0];
            const last = items[items.length - 1];
            if (!first) { event.preventDefault(); dialog?.focus(); return; }
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
    }, [showForm, showGoalForm]);

    const resetTransactionFilters = () => {
        setTransactionSearch('');
        setTransactionTypeFilter('all');
        setTransactionCategoryFilter('all');
        setTransactionSort('date-desc');
        setShowAllTransactions(false);
    };

    const handleBudgetCategoryChange = (category: string) => {
        const existingBudget = budgets.find((budget) => budget.category === category);
        setBudgetFormData({
            category,
            amount: existingBudget ? String(existingBudget.amount) : '',
        });
    };

    const handleExportCSV = () => {
        const reportDate = new Date().toLocaleDateString(localeForLanguage(financeLanguage));
        const period = selectedMonth === 'all' ? t.allTime : monthLabel(selectedMonth);
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
        const rows = visibleTransactions.map((t) => [
            t.date,
            t.type === 'income' ? FINANCE_COPY[financeLanguage].income : FINANCE_COPY[financeLanguage].expense,
            categoryLabel(t.category),
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

    const handleScanComplete = async (data: { date: string; amount: string; description: string; category: string }) => {
        if (!currentUser) return;

        try {
            const cleanAmount = data.amount.replace(/,/g, '.');
            const numericAmount = parseFloat(cleanAmount);

            if (isNaN(numericAmount)) {
                alert(t.invalidAmount);
                return;
            }

            await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
                date: data.date,
                description: data.description || t.scannedReceipt,
                category: data.category || 'Other',
                amount: numericAmount,
                type: 'expense',
                createdAt: Timestamp.now(),
            });
        } catch (error: any) {
            console.error('Error adding scanned transaction:', error);
            alert(formatCopy(t.failedToSave, { message: error.message }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || isSubmitting) return;

        const numericAmount = parseFloat(formData.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return;

        setIsSubmitting(true);
        try {
            const payload = {
                date: formData.date,
                description: formData.description.trim(),
                category: formData.category,
                amount: numericAmount,
                type: formData.type,
            };

            if (editingTransactionId) {
                await updateDoc(doc(db, 'users', currentUser.uid, 'transactions', editingTransactionId), {
                    ...payload,
                    updatedAt: Timestamp.now(),
                });
            } else {
                await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
                    ...payload,
                    createdAt: Timestamp.now(),
                });
            }

            closeTransactionForm();
        } catch (error) {
            console.error('Error saving transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBudgetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || isSubmitting) return;

        const numericAmount = parseFloat(budgetFormData.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return;

        setIsSubmitting(true);
        try {
            await setDoc(doc(db, 'users', currentUser.uid, 'budgets', budgetFormData.category), {
                category: budgetFormData.category,
                amount: numericAmount,
                updatedAt: Timestamp.now(),
            }, { merge: true });
            setBudgetFormData({ category: budgetFormData.category, amount: '' });
        } catch (error) {
            console.error('Error saving budget:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const handleAddToGoal = async (goalId: string) => {
        if (!currentUser || !addAmount) return;
        const goal = goals.find(g => g.id === goalId);
        const numericAmount = parseFloat(addAmount);
        if (!goal || isNaN(numericAmount) || numericAmount <= 0) return;

        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'goals', goalId), {
                currentAmount: goal.currentAmount + numericAmount,
            });
            setAddAmount('');
            setAddAmountGoalId(null);
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalId));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const handleDeleteBudget = async (category: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'budgets', category));
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

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
            <div dir={direction} className="mx-auto max-w-3xl py-16 text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 p-8">
                    <svg className="mx-auto mb-4 h-16 w-16 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="mb-2 text-2xl font-bold text-gray-800">{t.signInRequired}</h2>
                    <p className="mb-6 text-gray-600">{t.signInMessage}</p>
                    <a href="/login" className="inline-flex min-h-12 items-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition-[box-shadow,transform,background-color] duration-300 hover:shadow-xl">
                        {t.signIn}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div dir={direction} className={'finance-studio ' + textStartClass}>
            <div className="finance-shell">
                <header className="finance-heading">
                    <div className="finance-heading-top">
                        <p className="finance-eyebrow"><Leaf aria-hidden="true" />{t.workspace}</p>
                        <div className="finance-language" role="group" aria-label={t.language}>
                            {(['en', 'ar'] as FinanceLanguage[]).map(language => (
                                <button key={language} type="button" aria-pressed={financeLanguage === language} onClick={() => changeFinanceLanguage(language)}>
                                    {language === 'en' ? 'EN' : 'عربي'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="finance-heading-main">
                        <div>
                            <p className="finance-page-label">{t.financeTracker}</p>
                            <h1>{t.headline}</h1>
                            <p className="finance-description">{t.headerDescription}</p>
                        </div>
                        <div className="finance-heading-actions">
                            <ReceiptScanner onScanComplete={handleScanComplete} className="finance-button finance-button-secondary" label={t.scanReceipt} />
                            <button type="button" onClick={() => openAddTransaction()} className="finance-button finance-button-primary">
                                <Plus aria-hidden="true" />{t.addTransaction}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="finance-navigation-row">
                    <nav aria-label={t.dashboardNavigation} className="finance-section-nav">
                        <a href="#finance-overview"><WalletCards aria-hidden="true" />{t.overview}</a>
                        <a href="#finance-transactions">{t.transactions}</a>
                        <a href="#finance-budgets">{t.categoryBudgets}</a>
                        <a href="#finance-goals">{t.goals}</a>
                    </nav>
                    <label className="finance-period">
                        <CalendarDays aria-hidden="true" />
                        <span className="sr-only">{t.reportingPeriod}</span>
                        <select value={selectedMonth} onChange={event => { setSelectedMonth(event.target.value); setShowAllTransactions(false); }}>
                            <option value="all">{t.allTime}</option>
                            {monthOptions.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}
                        </select>
                    </label>
                </div>

                <section id="finance-overview" className="finance-overview" aria-label={t.overview} aria-busy={isLoading}>
                    <div className="finance-balance-card">
                        <div className="finance-balance-art" aria-hidden="true"><span /><span /><span /></div>
                        <div className="finance-stat-top"><span>{t.netBalance}</span><WalletCards aria-hidden="true" /></div>
                        <p className={'finance-balance-value' + (stats.balance < 0 ? ' is-negative' : '')}><bdi>{isLoading ? '—' : money(stats.balance)}</bdi></p>
                        <p className="finance-balance-help">{t.balanceNote}</p>
                        <div className="finance-balance-footer"><span>{periodLabel}</span><span>{t.currency}</span></div>
                    </div>
                    <div className="finance-stat-card finance-income-card">
                        <div className="finance-stat-top"><span>{t.income}</span><span className="finance-stat-icon"><ArrowUpRight aria-hidden="true" /></span></div>
                        <p className="finance-stat-value"><bdi>{isLoading ? '—' : money(stats.totalIncome)}</bdi></p>
                        <p className="finance-stat-help">{hasSelectedPeriodIncome ? formatCopy(t.incomeEntries, { count: filteredTransactions.filter(txn => txn.type === 'income').length }) : t.addIncomeToTrackSavings}</p>
                        <button type="button" onClick={() => openAddTransaction('income')} className="finance-stat-action"><Plus aria-hidden="true" />{t.addIncome}</button>
                    </div>
                    <div className="finance-stat-card finance-expense-card">
                        <div className="finance-stat-top"><span>{t.expenses}</span><span className="finance-stat-icon"><ArrowDownRight aria-hidden="true" /></span></div>
                        <p className="finance-stat-value"><bdi>{isLoading ? '—' : money(stats.totalExpenses)}</bdi></p>
                        <p className="finance-stat-help">{hasSelectedPeriodExpenses ? categoryLabel(topExpenseCategory) : t.addExpensesToBuildCategories}</p>
                        <button type="button" onClick={() => openAddTransaction('expense')} className="finance-stat-action"><Plus aria-hidden="true" />{t.logExpense}</button>
                    </div>
                    <div className="finance-stat-card finance-savings-card">
                        <div className="finance-stat-top"><span>{t.savingsRate}</span><Leaf aria-hidden="true" /></div>
                        <div className="finance-savings-gauge">
                            <svg viewBox="0 0 120 78" aria-hidden="true">
                                <path className="finance-gauge-track" d="M 14 65 A 46 46 0 0 1 106 65" pathLength="100" />
                                <path className={savingsRate < 0 ? 'finance-gauge-fill is-negative' : 'finance-gauge-fill'} d="M 14 65 A 46 46 0 0 1 106 65" pathLength="100" strokeDasharray={Math.max(0, Math.min(100, savingsRate)) + ' 100'} />
                            </svg>
                            <p className={savingsRate < 0 ? 'is-negative' : ''}><bdi>{isLoading || !hasSelectedPeriodIncome ? '—' : savingsRate + '%'}</bdi></p>
                        </div>
                        <p className="finance-stat-help">{hasSelectedPeriodIncome ? t.savingsHelp : t.addIncomeToTrackSavings}</p>
                    </div>
                </section>

                {!isLoading && !hasSelectedPeriodTransactions && (
                    <section className="finance-first-steps" aria-label={t.firstSteps}>
                        <div className="finance-first-steps-intro"><span className="finance-leaf-icon"><Leaf aria-hidden="true" /></span><div><h2>{t.firstSteps}</h2><p>{t.firstStepsHelp}</p></div></div>
                        <div className="finance-first-steps-actions">
                            <button type="button" onClick={() => openAddTransaction('income')}><span>1</span>{t.addIncome}<ArrowRight aria-hidden="true" /></button>
                            <button type="button" onClick={() => openAddTransaction('expense')}><span>2</span>{t.logExpense}<ArrowRight aria-hidden="true" /></button>
                            <a href="#finance-budgets"><span>3</span>{t.setBudget}<ArrowRight aria-hidden="true" /></a>
                        </div>
                    </section>
                )}

                <div className="finance-panel-row grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div id="finance-goals" className="finance-panel finance-goals order-2 lg:col-span-4">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">{t.goals}</h2>
                                <p className="mt-1 text-sm text-gray-500 tabular-nums">{formatCopy(t.fundedOverall, { percent: totalGoalProgress })}</p>
                            </div>
                            <button
                                onClick={() => setShowGoalForm(true)}
                                className="pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-forest-50 px-3 py-2 text-xs font-bold text-forest-700 transition-[transform,background-color] duration-200 hover:bg-forest-100"
                            >
                                <Target className="h-4 w-4" aria-hidden="true" />
                                {t.newGoal}
                            </button>
                        </div>
                        <div className="space-y-3">
                            {goals.length === 0 ? (
                                <div className="finance-goal-empty">
                                    <div className="finance-goal-art" aria-hidden="true"><span /><span /><Target /></div>
                                    <p className="font-semibold text-gray-700">{t.yourNextChapter}</p>
                                    <p className="mt-1 text-pretty text-sm text-gray-400">{t.goalInvitation}</p>
                                    <button type="button" className="finance-button finance-button-secondary" onClick={() => setShowGoalForm(true)}><Plus aria-hidden="true" />{t.createFirstGoal}</button>
                                </div>
                            ) : (
                                goals.map((goal) => {
                                    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                                    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
                                    const monthsLeft = getMonthsUntil(goal.targetDate);
                                    const monthlyNeed = monthsLeft ? remaining / monthsLeft : null;
                                    return (
                                        <div key={goal.id} className="group relative rounded-xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                            <button
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="pressable absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 opacity-0 transition-[opacity,transform,color,background-color] duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                aria-label={formatCopy(t.delete, { description: goal.name })}
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                            <div className="flex items-start justify-between gap-4 pr-8">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{goal.emoji} {goal.name}</p>
                                                    <p className="mt-1 text-xs text-gray-400">{t.target}: {goal.targetDate ? monthLabel(goal.targetDate) : t.noDate}</p>
                                                </div>
                                                <div className={textEndClass}>
                                                    <p className="text-sm font-bold text-gray-900 tabular-nums">{money(goal.currentAmount)}</p>
                                                    <p className="text-xs text-gray-400 tabular-nums">{t.of} {money(goal.targetAmount)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                                                <div className="h-2 rounded-full bg-gradient-to-r from-forest-700 to-forest-500 transition-[width] duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                                            </div>
                                            <p className="mt-2 text-xs font-medium text-gray-500 tabular-nums">
                                                {monthlyNeed !== null ? formatCopy(t.perMonthNeeded, { amount: money(monthlyNeed) }) : formatCopy(t.leftToFund, { amount: money(remaining) })}
                                            </p>
                                            {addAmountGoalId === goal.id ? (
                                                <div className="mt-3 flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={addAmount}
                                                        onChange={(e) => setAddAmount(e.target.value)}
                                                        placeholder={t.amount}
                                                        className="min-h-10 flex-1 rounded-xl bg-white px-3 py-2 text-sm shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-300"
                                                    />
                                                    <button onClick={() => handleAddToGoal(goal.id)} className="pressable min-h-10 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-[transform,background-color] duration-200">{t.add}</button>
                                                    <button onClick={() => setAddAmountGoalId(null)} className="pressable min-h-10 rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] transition-[transform,background-color] duration-200">{t.cancel}</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddAmountGoalId(goal.id)}
                                                    className="pressable mt-3 min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-forest-700 transition-[transform,background-color] duration-200 hover:bg-forest-50"
                                                >
                                                    {t.addFunds}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div id="finance-transactions" className="finance-panel finance-transactions order-1 lg:col-span-8">
                        <div className="space-y-4 px-5 py-5 md:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-950">{t.transactions}</h2>
                                    <p className="mt-1 text-sm text-gray-500 tabular-nums">{formatCopy(t.entriesForPeriod, { visible: visibleTransactions.length, total: filteredTransactions.length, period: periodLabel.toLowerCase() })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasActiveTransactionFilters && (
                                        <button
                                            onClick={resetTransactionFilters}
                                            className="pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <X className="h-4 w-4" aria-hidden="true" />
                                            {t.clear}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleExportCSV}
                                        className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-800"
                                        aria-label={t.exportCsv}
                                    >
                                        <Download className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="finance-transaction-filters">
                                <label className="relative block">
                                    <span className="sr-only">{t.searchTransactions}</span>
                                    <Search className={`pointer-events-none absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400`} aria-hidden="true" />
                                    <input
                                        type="search"
                                        value={transactionSearch}
                                        onChange={(e) => {
                                            setTransactionSearch(e.target.value);
                                            setShowAllTransactions(false);
                                        }}
                                        placeholder={t.searchPlaceholder}
                                        className={`min-h-10 w-full rounded-xl bg-gray-50 py-2 ${isArabic ? 'pl-3 pr-10' : 'pl-10 pr-3'} text-sm font-medium text-gray-800 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-300`}
                                    />
                                </label>
                                <select
                                    value={transactionTypeFilter}
                                    onChange={(e) => {
                                        setTransactionTypeFilter(e.target.value as TransactionTypeFilter);
                                        setTransactionCategoryFilter('all');
                                        setShowAllTransactions(false);
                                    }}
                                    className="min-h-10 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-300"
                                    aria-label={t.allTypes}
                                >
                                    <option value="all">{t.allTypes}</option>
                                    <option value="expense">{t.expenses}</option>
                                    <option value="income">{t.income}</option>
                                </select>
                                <select
                                    value={transactionCategoryFilter}
                                    onChange={(e) => {
                                        setTransactionCategoryFilter(e.target.value);
                                        setShowAllTransactions(false);
                                    }}
                                    className="min-h-10 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-300"
                                    aria-label={t.allCategories}
                                >
                                    <option value="all">{t.allCategories}</option>
                                    {transactionCategoryOptions.map((category) => (
                                        <option key={category} value={category}>{categoryLabel(category)}</option>
                                    ))}
                                </select>
                                <select
                                    value={transactionSort}
                                    onChange={(e) => setTransactionSort(e.target.value as TransactionSort)}
                                    className="min-h-10 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-300"
                                    aria-label={t.newestFirst}
                                >
                                    <option value="date-desc">{t.newestFirst}</option>
                                    <option value="date-asc">{t.oldestFirst}</option>
                                    <option value="amount-desc">{t.largestAmount}</option>
                                    <option value="amount-asc">{t.smallestAmount}</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="border-t border-gray-100 p-10 text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-forest-700"></div>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="finance-activity-empty">
                                <div className="finance-receipt-art" aria-hidden="true"><span className="finance-receipt-sheet"><ReceiptText /><i /><i /><i /></span><span className="finance-receipt-seal"><Check /></span></div>
                                <p className="text-lg font-semibold text-gray-800">{t.activityEmpty}</p>
                                <p className="mt-2 max-w-sm text-pretty text-sm text-gray-400">{t.activityEmptyHelp}</p>
                                <button
                                    onClick={() => openAddTransaction()}
                                    className="pressable mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:bg-gray-800"
                                >
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                    {t.addFirstTransaction}
                                </button>
                            </div>
                        ) : visibleTransactions.length === 0 ? (
                            <div className="flex min-h-[300px] flex-col items-center justify-center border-t border-gray-100 px-6 text-center">
                                <Search className="mb-4 h-10 w-10 text-gray-300" aria-hidden="true" />
                                <p className="text-lg font-semibold text-gray-800">{t.noMatchingTransactions}</p>
                                <p className="mt-2 max-w-sm text-pretty text-sm text-gray-400">{t.noMatchingHelp}</p>
                                <button
                                    onClick={resetTransactionFilters}
                                    className="pressable mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:bg-gray-800"
                                >
                                    {t.clearFilters}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto border-t border-gray-100">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-400">
                                            <tr>
                                                <th className={`px-6 py-3 ${textStartClass}`}>{t.transaction}</th>
                                                <th className={`hidden px-6 py-3 ${textStartClass} sm:table-cell`}>{t.date}</th>
                                                <th className={`hidden px-6 py-3 ${textStartClass} md:table-cell`}>{t.category}</th>
                                                <th className={`px-6 py-3 ${textEndClass}`}>{t.amountColumn}</th>
                                                <th className="px-3 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {transactionsToRender.map((txn) => (
                                                <tr key={txn.id} className="transition-[background-color] duration-200 hover:bg-gray-50/80">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${txn.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-forest-50 text-forest-700'}`}>
                                                                {txn.type === 'income' ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4" aria-hidden="true" />}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-gray-900">{txn.description}</p>
                                                                <p className="text-xs text-gray-400 sm:hidden">{dateLabel(txn.date)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden px-6 py-4 text-gray-500 sm:table-cell">{dateLabel(txn.date)}</td>
                                                    <td className="hidden px-6 py-4 md:table-cell">
                                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{categoryLabel(txn.category)}</span>
                                                    </td>
                                                    <td className={`px-6 py-4 ${textEndClass} font-bold tabular-nums ${txn.type === 'income' ? 'text-emerald-600' : 'text-gray-950'}`}>
                                                        {txn.type === 'income' ? '+' : '-'}{money(txn.amount)}
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => openEditTransaction(txn)}
                                                                className="pressable flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-[transform,background-color,color] duration-200 hover:bg-blue-50 hover:text-blue-600"
                                                                aria-label={formatCopy(t.edit, { description: txn.description })}
                                                            >
                                                                <Edit3 className="h-4 w-4" aria-hidden="true" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(txn.id)}
                                                                className="pressable flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-[transform,background-color,color] duration-200 hover:bg-red-50 hover:text-red-500"
                                                                aria-label={formatCopy(t.delete, { description: txn.description })}
                                                            >
                                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {visibleTransactions.length > 10 && (
                                    <div className="border-t border-gray-100 px-5 py-4 text-center">
                                        <button
                                            onClick={() => setShowAllTransactions((value) => !value)}
                                            className="pressable inline-flex min-h-10 items-center justify-center rounded-xl bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700 transition-[transform,background-color,color] duration-200 hover:bg-gray-950 hover:text-white"
                                        >
                                            {showAllTransactions ? t.showLatest10 : formatCopy(t.showAll, { count: visibleTransactions.length })}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="finance-panel-row grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="finance-panel finance-insights lg:col-span-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-balance text-lg font-semibold text-gray-950">{t.insights}</h2>
                                <p className="mt-1 text-pretty text-sm text-gray-500">{hasSelectedPeriodExpenses ? t.insightsReady : t.insightsEmpty}</p>
                            </div>
                            <SlidersHorizontal className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="finance-insight-grid">
                            <div className="rounded-xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.averageDailySpend}</p>
                                <p className={`mt-2 text-2xl font-bold tabular-nums ${hasSelectedPeriodExpenses ? 'text-gray-950' : 'text-gray-400'}`}>{hasSelectedPeriodExpenses ? money(insightData.averageDailySpend) : money(0)}</p>
                                <p className="mt-1 text-xs text-gray-500">{hasSelectedPeriodExpenses ? (insightData.daysLeft === null ? t.acrossTrackedDays : formatCopy(t.daysLeft, { count: insightData.daysLeft })) : t.waitingForExpenses}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.projectedSpend}</p>
                                <p className={`mt-2 text-2xl font-bold tabular-nums ${hasSelectedPeriodExpenses ? 'text-gray-950' : 'text-gray-400'}`}>{hasSelectedPeriodExpenses ? money(insightData.projectedSpend) : money(0)}</p>
                                <p className="mt-1 text-xs text-gray-500">{hasSelectedPeriodExpenses ? (selectedMonth === 'all' ? t.allTrackedSpend : t.atCurrentPace) : t.noProjectionYet}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.vsLastMonth}</p>
                                <p className={`mt-2 text-2xl font-bold tabular-nums ${!hasExpenseComparison ? 'text-gray-400' : insightData.expenseChangePercent !== null && insightData.expenseChangePercent > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {hasExpenseComparison ? `${insightData.expenseChangePercent! > 0 ? '+' : ''}${insightData.expenseChangePercent}%` : t.noBaseline}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">{hasExpenseComparison && insightData.previousExpenses !== null ? formatCopy(t.previousAmount, { amount: money(insightData.previousExpenses) }) : t.needsPriorMonthSpend}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{insightData.categoryTrend ? t.biggestIncrease : t.topCategory}</p>
                                <p className={`mt-2 truncate text-2xl font-bold ${hasSelectedPeriodExpenses ? 'text-gray-950' : 'text-gray-400'}`}>{insightData.categoryTrend ? categoryLabel(insightData.categoryTrend.category) : insightData.topCategory ? categoryLabel(insightData.topCategory.name) : t.noneYet}</p>
                                <p className="mt-1 text-xs text-gray-500 tabular-nums">
                                    {insightData.categoryTrend
                                        ? formatCopy(t.higher, { amount: money(insightData.categoryTrend.delta) })
                                        : insightData.topCategory
                                            ? money(insightData.topCategory.amount)
                                            : t.addExpenseFirst}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div id="finance-budgets" className="finance-panel finance-budgets lg:col-span-7">
                        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <h2 className="text-balance text-lg font-semibold text-gray-950">{t.categoryBudgets}</h2>
                                <p className="mt-1 text-pretty text-sm text-gray-500">{formatCopy(t.budgetSummary, { period: budgetPeriodLabel, spent: money(budgetSummary.totalSpent), budget: money(budgetSummary.totalBudget) })}</p>
                            </div>
                            <form onSubmit={handleBudgetSubmit} className="finance-budget-form">
                                <select
                                    value={budgetFormData.category}
                                    onChange={(e) => handleBudgetCategoryChange(e.target.value)}
                                    className="min-h-10 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-300"
                                    aria-label={t.budgetCategory}
                                >
                                    {CATEGORIES.expense.map((category) => (
                                        <option key={category} value={category}>{categoryLabel(category)}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={budgetFormData.amount}
                                    onChange={(e) => setBudgetFormData({ ...budgetFormData, amount: e.target.value })}
                                    placeholder={t.limit}
                                    aria-label={t.limit}
                                    className="min-h-10 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-300"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="pressable min-h-10 rounded-xl bg-gray-950 px-3 py-2 text-sm font-bold text-white transition-[transform,background-color,opacity] duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t.save}
                                </button>
                            </form>
                        </div>

                        <div className="finance-budget-totals">
                            <div className="rounded-2xl bg-forest-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">{t.remaining}</p>
                                <p className={`mt-1 text-xl font-bold tabular-nums ${budgetSummary.remaining < 0 ? 'text-red-600' : 'text-gray-950'}`}>{money(budgetSummary.remaining)}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.used}</p>
                                <p className="mt-1 text-xl font-bold text-gray-950 tabular-nums">{budgetSummary.progress}%</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.alerts}</p>
                                <p className={`mt-1 text-xl font-bold tabular-nums ${budgetSummary.overBudgetCount > 0 ? 'text-red-600' : 'text-gray-950'}`}>{budgetSummary.overBudgetCount}</p>
                            </div>
                        </div>

                        {activeBudgetRows.length === 0 ? (
                            <div className="finance-budget-empty">
                                <span className="finance-empty-icon"><PiggyBank aria-hidden="true" /></span>
                                <p className="font-semibold text-gray-700">{t.noBudgetsYet}</p>
                                <p className="mt-1 max-w-sm text-pretty text-sm text-gray-400">{t.noBudgetsHelp}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeBudgetRows.map((row) => {
                                    const cappedProgress = Math.min(row.progress, 100);
                                    const isOverBudget = row.hasBudget && row.spent > row.amount;
                                    return (
                                        <div key={row.category} className="rounded-xl bg-gray-50 p-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)]">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{categoryLabel(row.category)}</p>
                                                    <p className="mt-1 text-xs text-gray-500 tabular-nums">
                                                        {row.hasBudget
                                                            ? formatCopy(t.spentOf, { spent: money(row.spent), budget: money(row.amount) })
                                                            : formatCopy(t.spentWithoutBudget, { spent: money(row.spent) })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${isOverBudget ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600'}`}>
                                                        {row.hasBudget ? `${row.progress}%` : t.unset}
                                                    </span>
                                                    {row.hasBudget && (
                                                        <button
                                                            onClick={() => handleDeleteBudget(row.category)}
                                                            className="pressable flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-[transform,background-color,color] duration-200 hover:bg-red-50 hover:text-red-500"
                                                            aria-label={formatCopy(t.deleteBudget, { category: categoryLabel(row.category) })}
                                                        >
                                                            <X className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200">
                                                <div
                                                    className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-forest-700 to-forest-500'}`}
                                                    style={{ width: `${row.hasBudget ? cappedProgress : 0}%` }}
                                                />
                                            </div>
                                            <p className={`mt-2 text-xs font-medium tabular-nums ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                                                {row.hasBudget
                                                    ? isOverBudget
                                                        ? formatCopy(t.overBudget, { amount: money(Math.abs(row.remaining)) })
                                                        : formatCopy(t.remainingAmount, { amount: money(row.remaining) })
                                                    : t.setLimitToTrack}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="finance-panel-row grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="finance-panel finance-cashflow lg:col-span-3">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">{t.cashflowHistory}</h2>
                                <p className="mt-1 text-sm text-gray-500">{t.cashflowHelp}</p>
                            </div>
                        </div>
                        {monthlyChartData.some((month) => month.Income > 0 || month.Expenses > 0) ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 16, left: 0, bottom: 6 }}>
                                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                                <Tooltip formatter={(value: number) => [money(value), '']} contentStyle={{ borderRadius: '14px', border: '0', boxShadow: '0 18px 45px rgba(17, 24, 39, 0.14)' }} />
                                <Legend wrapperStyle={{ paddingTop: '12px' }} />
                                <Bar dataKey="Income" name={t.income} fill="#2F6B53" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Expenses" name={t.expenses} fill="#C49552" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="finance-mix-empty">
                                <TrendingUp className="mb-3 h-8 w-8 text-forest-400" aria-hidden="true" />
                                <p className="font-semibold text-gray-700">{t.cashflowEmpty}</p>
                                <p className="mt-1 text-sm text-gray-400">{t.cashflowEmptyHelp}</p>
                            </div>
                        )}
                    </div>

                    <div className="finance-panel finance-mix lg:col-span-2">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-950">{t.spendingMix}</h2>
                                <p className="mt-1 text-sm text-gray-500">{t.spendingMixHelp}</p>
                            </div>
                            <TrendingDown className="h-5 w-5 text-forest-600" aria-hidden="true" />
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
                                            <Tooltip formatter={(value: number) => money(value)} contentStyle={{ borderRadius: '14px', border: '0', boxShadow: '0 18px 45px rgba(17, 24, 39, 0.14)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-gray-400">{t.spent}</p>
                                            <p className="text-xl font-bold text-gray-950 tabular-nums">{money(stats.totalExpenses)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {pieChartData.map((item, index) => (
                                        <div key={item.name} className="flex min-h-9 items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                            <span className="truncate text-gray-600">{categoryLabel(item.name)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="finance-mix-empty">
                                <ReceiptText className="mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
                                <p className="font-semibold text-gray-700">{t.noExpenseData}</p>
                                <p className="mt-1 text-sm text-gray-400">{t.noExpenseDataHelp}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="finance-modal-backdrop">
                    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={showForm ? (editingTransactionId ? t.editTransaction : t.newTransaction) : t.newGoal} tabIndex={-1} dir={direction} className="finance-dialog">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">{editingTransactionId ? t.editTransaction : t.newTransaction}</h2>
                            <button onClick={closeTransactionForm} className="pressable flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-600" aria-label={t.closeTransactionForm}>
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex rounded-xl bg-gray-100 p-1">
                                <button type="button" aria-pressed={formData.type === 'expense'} onClick={() => setFormData({ ...formData, type: 'expense', category: '' })} className={`pressable flex-1 rounded-lg py-2 font-medium transition-[transform,background-color,color] duration-200 ${formData.type === 'expense' ? 'bg-[#996c3c] text-white' : 'text-gray-600'}`}>
                                    {t.expense}
                                </button>
                                <button type="button" aria-pressed={formData.type === 'income'} onClick={() => setFormData({ ...formData, type: 'income', category: '' })} className={`pressable flex-1 rounded-lg py-2 font-medium transition-[transform,background-color,color] duration-200 ${formData.type === 'income' ? 'bg-forest-700 text-white' : 'text-gray-600'}`}>
                                    {t.income}
                                </button>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.date}</label>
                                <input aria-label={t.date} type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.amountUsd}</label>
                                <input aria-label={t.amountUsd} type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.category}</label>
                                <select aria-label={t.category} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" required>
                                    <option value="">{t.selectCategory}</option>
                                    {CATEGORIES[formData.type].map((cat) => (<option key={cat} value={cat}>{categoryLabel(cat)}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.description}</label>
                                <input aria-label={t.description} type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t.coffeeExample} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" required />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="pressable w-full rounded-lg bg-forest-800 py-3 font-semibold text-white transition-[transform,background-color,opacity] duration-200 hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {isSubmitting ? t.saving : editingTransactionId ? t.updateTransaction : t.saveTransaction}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showGoalForm && (
                <div className="finance-modal-backdrop">
                    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={showForm ? (editingTransactionId ? t.editTransaction : t.newTransaction) : t.newGoal} tabIndex={-1} dir={direction} className="finance-dialog">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">{t.newGoal}</h2>
                            <button onClick={() => setShowGoalForm(false)} className="pressable flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-600" aria-label={t.closeGoalForm}>
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <form onSubmit={handleGoalSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.emoji}</label>
                                <div className="flex flex-wrap gap-2">
                                    {GOAL_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setGoalFormData({ ...goalFormData, emoji })}
                                            className={`pressable h-10 w-10 rounded-lg border-2 text-xl transition-[transform,background-color,border-color] duration-200 ${goalFormData.emoji === emoji ? 'border-forest-700 bg-forest-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.goalName}</label>
                                <input aria-label={t.goalName} type="text" value={goalFormData.name} onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })} placeholder={t.goalPlaceholder} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t.targetAmountUsd}</label>
                                    <input aria-label={t.targetAmountUsd} type="number" step="0.01" min="1" value={goalFormData.targetAmount} onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })} placeholder="15000" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t.currentAmountUsd}</label>
                                    <input aria-label={t.currentAmountUsd} type="number" step="0.01" min="0" value={goalFormData.currentAmount} onChange={(e) => setGoalFormData({ ...goalFormData, currentAmount: e.target.value })} placeholder="0" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t.targetDate}</label>
                                <input aria-label={t.targetDate} type="month" value={goalFormData.targetDate} onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-forest-400" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="pressable w-full rounded-lg bg-forest-800 py-3 font-semibold text-white transition-[transform,background-color,opacity] duration-200 hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {isSubmitting ? t.saving : t.createGoal}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceTrackerPage;
