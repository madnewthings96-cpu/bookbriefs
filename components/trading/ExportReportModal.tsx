import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    Check,
    FileDown,
    LineChart,
    Loader2,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import { getModalFocusWrapTarget } from '../modalFocusTrap';
import { Trade } from '../../utils/tradingUtils';
import { buildMonthlyTradingReportModel } from '../../utils/tradingReportModel';
import { generateMonthlyReport, getAvailableMonths } from '../../utils/pdfReportGenerator';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    trades: Trade[];
    startingBalance: number;
    currentBalance: number;
    userEmail?: string;
}

const formatMoney = (value: number, showSign = false) => {
    const prefix = showSign && value > 0 ? '+' : value < 0 ? '-' : '';
    return `${prefix}$${Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const reportContents = [
    { icon: BarChart3, label: 'Executive performance review' },
    { icon: LineChart, label: 'Balance movement and equity curve' },
    { icon: ShieldCheck, label: 'Risk and discipline signals' },
    { icon: BookOpen, label: 'Detailed chronological trade ledger' },
];

const ExportReportModal: React.FC<ExportReportModalProps> = ({
    isOpen,
    onClose,
    trades,
    startingBalance,
    currentBalance,
    userEmail,
}) => {
    const availableMonths = useMemo(() => getAvailableMonths(trades), [trades]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(() => {
        const first = getAvailableMonths(trades)[0];
        return first ? { month: first.month, year: first.year } : null;
    });
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    const shouldReduceMotion = useReducedMotion();

    onCloseRef.current = onClose;

    useEffect(() => {
        if (availableMonths.length === 0) {
            setSelectedMonth(null);
            return;
        }

        const selectionStillExists = selectedMonth && availableMonths.some(
            (period) => period.month === selectedMonth.month && period.year === selectedMonth.year,
        );
        if (!selectionStillExists) {
            setSelectedMonth({ month: availableMonths[0].month, year: availableMonths[0].year });
        }
    }, [availableMonths, selectedMonth]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isGenerating) {
                event.preventDefault();
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
            ));
            const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
            const wrapTarget = getModalFocusWrapTarget(activeIndex, focusable.length, event.shiftKey);
            if (wrapTarget !== null) {
                event.preventDefault();
                focusable[wrapTarget]?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.cancelAnimationFrame(frame);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [isGenerating, isOpen]);

    const reportModel = useMemo(() => selectedMonth
        ? buildMonthlyTradingReportModel({
            trades,
            startingBalance,
            month: selectedMonth.month,
            year: selectedMonth.year,
        })
        : null, [selectedMonth, startingBalance, trades]);

    const handleDownload = async () => {
        if (!selectedMonth) return;
        setIsGenerating(true);
        try {
            await generateMonthlyReport({
                trades,
                startingBalance,
                currentBalance,
                month: selectedMonth.month,
                year: selectedMonth.year,
                userEmail,
            });
            onClose();
        } catch (error) {
            console.error('Error generating report:', error);
            window.alert('The fieldbook could not be generated. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-[#06130E]/70 p-3 backdrop-blur-[8px] sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    onMouseDown={() => !isGenerating && onClose()}
                >
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="export-report-title"
                        aria-describedby="export-report-description"
                        tabIndex={-1}
                        className="relative my-auto grid max-h-[92svh] w-full max-w-[880px] overflow-y-auto rounded-[28px] border border-white/20 bg-[#F3EFE4] text-[#16231E] shadow-[0_36px_110px_rgba(1,16,10,0.48)] outline-none lg:grid-cols-[0.88fr_1.12fr] lg:overflow-hidden"
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.975 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isGenerating}
                            aria-label="Close report builder"
                            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#173D30]/85 text-white shadow-lg backdrop-blur transition duration-200 hover:-rotate-3 hover:bg-[#234B3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7AE69] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EFE4] disabled:opacity-50 lg:bg-white/10"
                        >
                            <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                        </button>

                        <section className="relative isolate min-h-[340px] overflow-hidden bg-[#102E24] px-6 py-7 text-[#FFFDF7] sm:px-8 sm:py-9 lg:min-h-[620px]">
                            <div aria-hidden="true" className="absolute -left-20 top-40 -z-10 h-64 w-64 rounded-full bg-[#4A6741]/25 blur-3xl" />
                            <div aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-60 w-60 rounded-full border border-[#D7AE69]/15" />
                            <div aria-hidden="true" className="absolute -right-5 top-14 -z-10 h-40 w-40 rounded-full border border-[#D7AE69]/10" />

                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D7AE69]">
                                <Sparkles aria-hidden="true" className="h-4 w-4" />
                                Monthly fieldbook
                            </div>
                            <h2 id="export-report-title" className="mt-4 max-w-sm font-serif text-[34px] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[42px]">
                                Turn the month into a better next decision.
                            </h2>
                            <p id="export-report-description" className="mt-4 max-w-sm text-sm leading-6 text-[#C8D3CD]">
                                Build a polished record of performance, risk, psychology, and every trade behind the result.
                            </p>

                            <div className="relative mt-8 overflow-hidden rounded-[22px] border border-white/10 bg-[#173D30]/80 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
                                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C89A49] via-[#E2C68F] to-transparent" />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D7AE69]">Ta7leel Trading Fieldbook</p>
                                        <p className="mt-2 font-serif text-2xl font-semibold text-white">{reportModel?.periodLabel ?? 'Monthly review'}</p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C8D3CD]">PDF</span>
                                </div>

                                <div className="mt-8">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CB1A6]">Closing balance</p>
                                    <p className="mt-1 text-3xl font-bold tracking-[-0.035em] tabular-nums">
                                        {formatMoney(reportModel?.closingBalance ?? startingBalance)}
                                    </p>
                                    <p className={`mt-1 text-sm font-semibold tabular-nums ${(reportModel?.returnAmount ?? 0) >= 0 ? 'text-[#8DD0AF]' : 'text-[#F0A095]'}`}>
                                        {formatMoney(reportModel?.returnAmount ?? 0, true)} · {(reportModel?.returnPercent ?? 0) >= 0 ? '+' : ''}{(reportModel?.returnPercent ?? 0).toFixed(2)}%
                                    </p>
                                </div>

                                <div aria-hidden="true" className="mt-7 flex items-end gap-1">
                                    {[22, 27, 24, 36, 33, 48, 43, 58, 55, 71, 66, 82].map((height, index) => (
                                        <span key={index} className="flex-1 rounded-full bg-gradient-to-t from-[#C89A49]/40 to-[#E2C68F]" style={{ height }} />
                                    ))}
                                </div>
                            </div>

                            <p className="mt-5 flex items-center gap-2 text-xs text-[#9CB1A6]">
                                <Check aria-hidden="true" className="h-4 w-4 text-[#D7AE69]" />
                                Print-ready A4 · private to your device
                            </p>
                        </section>

                        <section className="flex flex-col px-5 pb-5 pt-20 sm:px-8 sm:pb-8 sm:pt-16 lg:min-h-[620px] lg:px-9 lg:pb-8 lg:pt-9">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9A713B]">Report builder</p>
                                <h3 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.03em] text-[#102E24]">Choose your review period</h3>
                                <p className="mt-2 text-sm leading-6 text-[#607168]">One month, distilled into the signals worth carrying forward.</p>
                            </div>

                            <div className="mt-6">
                                {availableMonths.length > 0 ? (
                                    <>
                                        <label htmlFor="export-report-month" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#465A50]">
                                            Trading month
                                        </label>
                                        <div className="relative">
                                            <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7B8E83]" />
                                            <select
                                                id="export-report-month"
                                                value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
                                                onChange={(event) => {
                                                    const [year, month] = event.target.value.split('-').map(Number);
                                                    setSelectedMonth({ year, month });
                                                }}
                                                className="min-h-12 w-full appearance-none rounded-2xl border border-[#102E24]/12 bg-[#FFFDF7] py-3 pl-12 pr-10 text-sm font-semibold text-[#102E24] shadow-sm outline-none transition focus:border-[#C89A49] focus:ring-4 focus:ring-[#C89A49]/15"
                                            >
                                                {availableMonths.map((period) => (
                                                    <option key={`${period.year}-${period.month}`} value={`${period.year}-${period.month}`}>
                                                        {period.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7B8E83]">⌄</span>
                                        </div>
                                    </>
                                ) : (
                                    <div role="status" className="rounded-2xl border border-dashed border-[#102E24]/20 bg-[#FFFDF7]/65 px-5 py-7 text-center">
                                        <CalendarDays aria-hidden="true" className="mx-auto h-8 w-8 text-[#9AAB9F]" />
                                        <p className="mt-3 text-sm font-semibold text-[#30483D]">No trading months yet</p>
                                        <p className="mt-1 text-xs text-[#718078]">Add your first trade to unlock monthly exports.</p>
                                    </div>
                                )}
                            </div>

                            {reportModel && (
                                <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#102E24]/10 bg-[#FFFDF7] shadow-sm">
                                    {[
                                        ['Trades', String(reportModel.stats.totalTrades)],
                                        ['Win rate', `${reportModel.stats.winRate.toFixed(1)}%`],
                                        ['Net P&L', formatMoney(reportModel.returnAmount, true)],
                                    ].map(([label, value], index) => (
                                        <div key={label} className={`px-3 py-4 ${index > 0 ? 'border-l border-[#102E24]/10' : ''}`}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7B8B83]">{label}</p>
                                            <p className={`mt-1 truncate text-sm font-bold tabular-nums ${label === 'Net P&L' ? (reportModel.returnAmount >= 0 ? 'text-[#2F8A67]' : 'text-[#C65B50]') : 'text-[#102E24]'}`}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6">
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#63746B]">Inside your fieldbook</p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {reportContents.map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#102E24]/8 bg-white/45 px-3 py-2.5">
                                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#DCE5DA] text-[#234B3B]">
                                                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                            </span>
                                            <span className="text-xs font-semibold leading-4 text-[#465A50]">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-7">
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isGenerating}
                                        className="min-h-12 rounded-2xl border border-[#102E24]/12 bg-[#FFFDF7] px-5 text-sm font-bold text-[#465A50] transition hover:border-[#102E24]/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89A49] disabled:opacity-50"
                                    >
                                        Keep editing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        disabled={isGenerating || !selectedMonth}
                                        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#234B3B] to-[#102E24] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(16,46,36,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(16,46,36,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89A49] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EFE4] active:translate-y-0 disabled:pointer-events-none disabled:opacity-45"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                                                Composing fieldbook…
                                            </>
                                        ) : (
                                            <>
                                                <FileDown aria-hidden="true" className="h-4 w-4" />
                                                Download fieldbook
                                                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExportReportModal;
