import React, { useState } from 'react';
import AdSenseSlot, { readTradeAnalyzerAdSenseConfig } from '../components/AdSenseSlot';
import { ImportPanel } from '../components/trade-analyzer/ImportPanel';
import { VerifyPanel, isValidTimezone } from '../components/trade-analyzer/VerifyPanel';
import { analyzeTrades, type AnalysisModel } from '../features/trade-analyzer/analyze';
import { canAnalyze, importHistory } from '../features/trade-analyzer/importHistory';
import type { ImportPlatform, ImportReport } from '../features/trade-analyzer/types';
import useSEO from '../hooks/useSEO';

type Phase = 'empty' | 'reading' | 'unsupported' | 'verifying' | 'analyzed';
const adConfig = readTradeAnalyzerAdSenseConfig((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});

const TradeAnalyzerPage: React.FC = () => {
  useSEO({
    title: 'Free MT5 & cTrader Trade Analyzer | Ta7leel',
    description: 'Import an MT5 or cTrader history, verify the records, and review closed-trade performance in a private, browser-based dashboard.',
    keywords: 'MT5 trade analyzer, cTrader trade analytics, trading history dashboard, trading journal',
    canonical: 'https://www.ta7leel.pro/trade-analyzer/',
  });
  const [platform, setPlatform] = useState<ImportPlatform>('mt5');
  const [phase, setPhase] = useState<Phase>('empty');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [model, setModel] = useState<AnalysisModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');
  const [startingBalance, setStartingBalance] = useState('');

  const reset = (nextPlatform = platform) => {
    setPlatform(nextPlatform);
    setPhase('empty');
    setReport(null);
    setModel(null);
    setError(null);
    setCurrency('');
    setTimezone('');
    setStartingBalance('');
  };

  const submit = async (input: { name?: string; text: string }) => {
    setPhase('reading');
    setError(null);
    try {
      const parsed = await importHistory({ ...input, platform });
      if (!parsed.records.length) {
        setError(parsed.issues[0]?.message ?? 'No closed trades were found. Check the export format.');
        setPhase('unsupported');
        return;
      }
      setReport(parsed);
      setCurrency(parsed.currency ?? '');
      setTimezone(parsed.sourceTimezone ?? '');
      setPhase('verifying');
    } catch {
      setError('This history could not be read. Check the format and try again.');
      setPhase('unsupported');
    }
  };

  const analyze = () => {
    if (!report || !canAnalyze(report) || !/^[A-Z]{3}$/.test(currency) || !isValidTimezone(timezone)) return;
    const balance = startingBalance.trim() ? Number(startingBalance) : null;
    if (balance !== null && (!Number.isFinite(balance) || balance <= 0)) return;
    setModel(analyzeTrades({ report, currency, timezone, startingBalance: balance }));
    setPhase('analyzed');
  };

  return <div className="trade-analyzer">
    <div className="ta-shell">
      <header className="ta-hero">
        <div className="ta-hero-copy">
          <p className="ta-kicker"><span className="ta-kicker-line" /> Trading desk · Free tool</p>
          <h1>Trade Analyzer<span className="ta-title-dot">.</span></h1>
          <p className="ta-hero-lede">Turn a trading history into a clearer picture of your closed trades—without connecting a broker or creating an account.</p>
          <div className="ta-hero-meta"><span>MT5 + cTrader</span><span>Closed-trade review</span><span>No AI credits per analysis</span></div>
        </div>
        <div className="ta-hero-mark" aria-hidden="true"><span>∿</span><small>REVIEW THE RECORD</small></div>
      </header>

      <nav className="ta-steps" aria-label="Analysis steps"><span className={phase === 'empty' || phase === 'reading' || phase === 'unsupported' ? 'is-current' : ''}>01 <strong>Import</strong></span><i aria-hidden="true" /><span className={phase === 'verifying' ? 'is-current' : ''}>02 <strong>Check</strong></span><i aria-hidden="true" /><span className={phase === 'analyzed' ? 'is-current' : ''}>03 <strong>Review</strong></span></nav>

      {(phase === 'empty' || phase === 'reading' || phase === 'unsupported') && <div className="ta-import-layout">
        <div className="ta-main-column">
          <ImportPanel platform={platform} busy={phase === 'reading'} error={error} onPlatformChange={(next) => reset(next)} onSubmit={submit} />
          <section className="ta-how-card" aria-label="How to import"><h2>Before you begin</h2><div><p><strong>From MT5</strong><br />Save an HTML History report, or copy a table with column headers.</p><p><strong>From cTrader</strong><br />Save a CSV statement, or copy a History table with headers.</p></div></section>
        </div>
        <AdSenseSlot config={adConfig} className="ta-ad-slot" />
      </div>}

      {phase === 'verifying' && report && <VerifyPanel report={report} currency={currency} timezone={timezone} startingBalance={startingBalance} onCurrencyChange={setCurrency} onTimezoneChange={setTimezone} onStartingBalanceChange={setStartingBalance} onBack={() => reset()} onAnalyze={analyze} />}
      {phase === 'analyzed' && report && model && <section className="ta-result-placeholder" aria-live="polite"><h2>Analysis ready</h2><p>{model.metrics.count} closed trades · {model.metrics.netPnl.toFixed(2)} {currency} net P&L</p><button type="button" className="ta-secondary-button" onClick={() => reset()}>Start over</button></section>}
    </div>
  </div>;
};

export default TradeAnalyzerPage;
