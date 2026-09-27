import React, { useRef, useState } from 'react';
import type { ImportPlatform } from '../../features/trade-analyzer/types';

type ImportPanelProps = {
  platform: ImportPlatform;
  busy: boolean;
  error: string | null;
  onPlatformChange: (platform: ImportPlatform) => void;
  onSubmit: (input: { name?: string; text: string }) => void | Promise<void>;
};

export const ImportPanel: React.FC<ImportPanelProps> = ({ platform, busy, error, onPlatformChange, onSubmit }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [paste, setPaste] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const chooseFile = (next: File | null) => {
    setFile(next);
    if (next) setPaste('');
    setLocalError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!file && !paste.trim()) { setLocalError('Choose a statement file or paste a History table.'); return; }
    if (file && file.size > 5 * 1024 * 1024) { setLocalError('The file must be 5 MiB or smaller.'); return; }
    setLocalError(null);
    try { await onSubmit({ name: file?.name, text: file ? await file.text() : paste }); }
    catch { setLocalError('The file could not be read. Try exporting it again.'); }
  };

  return <form className="ta-import-card" onSubmit={submit}>
    <div className="ta-card-heading">
      <div><p className="ta-eyebrow">Start with your history</p><h2>Import closed trades</h2></div>
      <span className="ta-private-chip">No broker connection</span>
    </div>
    <fieldset className="ta-platform-fieldset">
      <legend>Trading platform</legend>
      <div className="ta-platform-toggle">
        {(['mt5', 'ctrader'] as const).map((option) => <button key={option} type="button" aria-pressed={platform === option} className={platform === option ? 'is-active' : ''} onClick={() => { onPlatformChange(option); chooseFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
          {option === 'mt5' ? 'MT5' : 'cTrader'}
        </button>)}
      </div>
    </fieldset>
    <div className="ta-input-grid">
      <div className={`ta-upload-zone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0] ?? null); }}>
        <span className="ta-upload-symbol" aria-hidden="true">↥</span>
        <label htmlFor="trade-history-file">Upload history</label>
        <p>{file ? file.name : platform === 'mt5' ? 'MT5 HTML report' : 'cTrader CSV statement'}</p>
        <input ref={fileRef} id="trade-history-file" type="file" accept=".html,.htm,.csv,.tsv,.txt,text/html,text/csv,text/plain" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
        <small>Choose a file or drop it here · up to 5 MiB</small>
      </div>
      <div className="ta-paste-zone">
        <label htmlFor="trade-history-paste">Paste history</label>
        <p>Copy rows with column headers from your platform’s History tab.</p>
        <textarea id="trade-history-paste" value={paste} onChange={(event) => { setPaste(event.target.value); if (event.target.value && file) { setFile(null); if (fileRef.current) fileRef.current.value = ''; } }} placeholder="Time\tSymbol\tProfit…" rows={6} />
      </div>
    </div>
    {(localError || error) && <p className="ta-alert ta-alert-error" role="alert">{localError || error}</p>}
    <div className="ta-import-bottom"><p>Ta7leel processes your history in this browser. It is not uploaded unless you choose to save eligible trades to your journal.</p><button type="submit" className="ta-primary-button" disabled={busy}>{busy ? 'Reading history…' : 'Check my history'} <span aria-hidden="true">→</span></button></div>
  </form>;
};
