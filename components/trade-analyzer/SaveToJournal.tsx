import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { firestoreJournalWriter, MAX_JOURNAL_IMPORT_RECORDS, previewJournalSave, saveJournalTrades, type SavePreview, type SaveResult } from '../../features/trade-analyzer/journalSave';
import type { ImportReport } from '../../features/trade-analyzer/types';

type Props = { report: ImportReport; currency: string; timezone: string; userId: string | null };
const writer = firestoreJournalWriter(db);

export const SaveToJournal: React.FC<Props> = ({ report, currency, timezone, userId }) => {
  const [preview, setPreview] = useState<SavePreview | null>(null);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setPreview(null);
    setResult(null);
  }, [userId, report, currency, timezone]);

  const checkJournal = async () => {
    if (!userId || currency !== 'USD') return;
    setBusy(true);
    setError(null);
    try { setPreview(await previewJournalSave(userId, report.records, currency, timezone, writer)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not check your journal. Please try again.'); }
    finally { setBusy(false); }
  };

  const save = async () => {
    if (!userId || currency !== 'USD' || !preview || preview.ready === 0 || preview.collisions > 0) return;
    if (auth.currentUser?.uid !== userId) { setError('Your session changed. Please sign in again before saving.'); return; }
    setBusy(true);
    setError(null);
    try {
      const next = await saveJournalTrades(userId, report.records, currency, timezone, writer);
      setResult(next);
      setPreview({ ready: 0, existing: next.saved + next.existing, notSaveable: next.notSaveable, collisions: 0 });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save all trades. Your analysis is still here; retry after checking the journal.');
      setPreview(null);
    } finally { setBusy(false); }
  };

  return <section className="ta-journal-card" aria-labelledby="ta-journal-heading">
    <div><p className="ta-eyebrow">Keep the record</p><h2 id="ta-journal-heading">Save to journal</h2><p>Save eligible closed trades to your Ta7leel journal with broker-reported net P&amp;L, known costs, entry and close times. Unavailable stop losses and notes stay blank. Your original export is not stored.</p></div>
    {currency !== 'USD' ? <div className="ta-journal-action"><p role="note">This is a USD-only journal. You can analyze this {currency} history here, but saving it would mix currencies in the journal totals. No conversion is assumed.</p></div> : !userId ? <div className="ta-journal-action"><p>Analysis stays private in this browser until you choose to save.</p><Link className="ta-primary-button" to="/login" state={{ from: '/trade-analyzer' }}>Sign in to save</Link></div> :
      <div className="ta-journal-action">
        {report.records.length > MAX_JOURNAL_IMPORT_RECORDS ? <p role="alert">Journal saving supports up to {MAX_JOURNAL_IMPORT_RECORDS.toLocaleString()} trades per import. Analyze a shorter date range before saving.</p> : preview ? <p><strong>{preview.ready}</strong> new · <strong>{preview.existing}</strong> already saved · <strong>{preview.notSaveable}</strong> incomplete{preview.collisions > 0 && <> · <strong>{preview.collisions}</strong> conflicts</>}</p> : <p>Check which eligible trades are new before writing anything to your journal.</p>}
        {preview?.collisions ? <p role="alert">A journal ID conflicts with an unrelated entry. Nothing will be overwritten.</p> : null}
        {error && <p role="alert">{error}</p>}
        {result && <p role="status">Saved {result.saved} {result.saved === 1 ? 'trade' : 'trades'}. {result.existing} already saved. <Link to="/trading-journal">Open journal</Link></p>}
        {!preview ? <button type="button" className="ta-primary-button" onClick={checkJournal} disabled={busy || report.records.length > MAX_JOURNAL_IMPORT_RECORDS}>{busy ? 'Checking…' : 'Check journal'}</button> :
          <button type="button" className="ta-primary-button" onClick={save} disabled={busy || preview.ready === 0 || preview.collisions > 0}>{busy ? 'Saving…' : 'Save eligible trades'}</button>}
      </div>}
  </section>;
};
