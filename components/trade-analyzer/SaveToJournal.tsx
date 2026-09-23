import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { firestoreJournalWriter, previewJournalSave, saveJournalTrades, type SavePreview, type SaveResult } from '../../features/trade-analyzer/journalSave';
import type { ImportReport } from '../../features/trade-analyzer/types';

type Props = { report: ImportReport; currency: string; timezone: string; userId: string | null };
const writer = firestoreJournalWriter(db);

export const SaveToJournal: React.FC<Props> = ({ report, currency, timezone, userId }) => {
  const [preview, setPreview] = useState<SavePreview | null>(null);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || currency !== 'USD') return;
    let cancelled = false;
    setError(null);
    setPreview(null);
    previewJournalSave(userId, report.records, currency, timezone, writer)
      .then((next) => { if (!cancelled) setPreview(next); })
      .catch(() => { if (!cancelled) setError('Could not check your journal. Please try again.'); });
    return () => { cancelled = true; };
  }, [userId, report, currency, timezone]);

  const save = async () => {
    if (!userId || currency !== 'USD' || !preview || preview.ready === 0 || preview.collisions > 0) return;
    if (auth.currentUser?.uid !== userId) { setError('Your session changed. Please sign in again before saving.'); return; }
    setBusy(true);
    setError(null);
    try {
      const next = await saveJournalTrades(userId, report.records, currency, timezone, writer);
      setResult(next);
      setPreview(await previewJournalSave(userId, report.records, currency, timezone, writer));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save all trades. Your analysis is still here; retry after checking the journal.');
      try { setPreview(await previewJournalSave(userId, report.records, currency, timezone, writer)); } catch { /* retain current preview */ }
    } finally { setBusy(false); }
  };

  return <section className="ta-journal-card" aria-labelledby="ta-journal-heading">
    <div><p className="ta-eyebrow">Keep the record</p><h2 id="ta-journal-heading">Save to journal</h2><p>Save eligible closed trades to your Ta7leel journal with broker-reported net P&amp;L, known costs, entry and close times. Unavailable stop losses and notes stay blank. Your original export is not stored.</p></div>
    {currency !== 'USD' ? <div className="ta-journal-action"><p role="note">This is a USD-only journal. You can analyze this {currency} history here, but saving it would mix currencies in the journal totals. No conversion is assumed.</p></div> : !userId ? <div className="ta-journal-action"><p>Analysis stays private in this browser until you choose to save.</p><Link className="ta-primary-button" to="/login" state={{ from: '/trade-analyzer' }}>Sign in to save</Link></div> :
      <div className="ta-journal-action">
        {preview ? <p><strong>{preview.ready}</strong> new · <strong>{preview.existing}</strong> already saved · <strong>{preview.notSaveable}</strong> incomplete{preview.collisions > 0 && <> · <strong>{preview.collisions}</strong> conflicts</>}</p> : <p>Checking your journal…</p>}
        {preview?.collisions ? <p role="alert">A journal ID conflicts with an unrelated entry. Nothing will be overwritten.</p> : null}
        {error && <p role="alert">{error}</p>}
        {result && <p role="status">Saved {result.saved} {result.saved === 1 ? 'trade' : 'trades'}. {result.existing} already saved. <Link to="/trading-journal">Open journal</Link></p>}
        <button type="button" className="ta-primary-button" onClick={save} disabled={busy || !preview || preview.ready === 0 || preview.collisions > 0}>{busy ? 'Saving…' : 'Save eligible trades'}</button>
      </div>}
  </section>;
};
