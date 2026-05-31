import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, X, Check, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from './Toast';

export default function ImportCSV({ onImport, onClose }) {
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();
  const toast = useToast();

  const handleFile = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.map(row => {
          const r = {};
          Object.keys(row).forEach(k => r[k.trim().toLowerCase().replace(/\s+/g, '_')] = row[k]);
          return r;
        });
        setPreview(rows);
      },
    });
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await onImport(preview);
      setResult(res);
    } catch (e) {
      toast(e.message, 'error');
    }
    setImporting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.5)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%',
        maxWidth: '600px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center' }}>
          <FileText size={20} color="var(--blue)" style={{ marginRight: '10px' }} />
          <h2 style={{ flex: 1, fontSize: '18px' }}>Import from CSV</h2>
          <button onClick={onClose} style={{ background: 'var(--sand)', borderRadius: '50%', padding: '6px', color: 'var(--ink-soft)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {result ? (
            <div>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Check size={48} color="var(--success)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Import complete</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>{result.imported}</div>
                  <div style={{ fontSize: '13px', color: 'var(--success)' }}>Imported</div>
                </div>
                <div style={{ background: 'var(--sand)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink-soft)' }}>{result.skipped}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Skipped (duplicates)</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--danger)', fontWeight: 600, fontSize: '13px' }}>
                    <AlertTriangle size={14} /> {result.errors.length} errors
                  </div>
                  {result.errors.map((e, i) => (
                    <div key={i} style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '2px' }}>{e}</div>
                  ))}
                </div>
              )}
            </div>
          ) : !preview ? (
            <>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                padding: '48px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: '20px',
                background: 'var(--cream)',
              }}
                onClick={() => fileRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              >
                <Upload size={32} color="var(--blue)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Drop your CSV here or tap to browse</p>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Supports .csv files exported from Notes, Google Sheets, etc.</p>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>
              <div style={{ background: 'var(--blue-pale)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--blue)', marginBottom: '6px' }}>Expected CSV columns:</p>
                <code style={{ fontSize: '12px', color: 'var(--blue-light)', display: 'block' }}>
                  name, google_maps_url, notes, category, city, tags
                </code>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '6px' }}>
                  Only <strong>name</strong> and <strong>google_maps_url</strong> are required. Tags should be comma-separated within quotes.
                </p>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
                Found <strong>{preview.length} rows</strong>. Review before importing:
              </p>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--sand)' }}>
                      {['name', 'category', 'city', 'google_maps_url', 'notes'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-soft)' }}>
                        {['name', 'category', 'city', 'google_maps_url', 'notes'].map(k => (
                          <td key={k} style={{ padding: '8px 12px', color: 'var(--ink)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row[k] || <span style={{ color: 'var(--ink-muted)' }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 20 && (
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '8px', textAlign: 'center' }}>
                  Showing first 20 of {preview.length} rows
                </p>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: '10px' }}>
          {result ? (
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600 }}>
              Done
            </button>
          ) : preview ? (
            <>
              <button onClick={() => setPreview(null)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--sand)', color: 'var(--ink-soft)', fontWeight: 600 }}>
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                style={{ flex: 2, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--blue)', color: 'white', fontWeight: 600, opacity: importing ? 0.7 : 1 }}
              >
                {importing ? 'Importing...' : `Import ${preview.length} places`}
              </button>
            </>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--sand)', color: 'var(--ink-soft)', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
