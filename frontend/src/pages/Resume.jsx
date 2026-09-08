import React, { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Resume() {
  const { auth } = useAuth();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleScan(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.uploadResume(text, auth.token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">ATS Resume Scanner</h2>
      <p className="text-sm text-gray-600 mb-4">
        Paste your resume text below. Scoring runs locally — no external API or cost.
      </p>

      <form onSubmit={handleScan} className="space-y-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
          placeholder="Paste your resume text here..."
          className="w-full border rounded-md px-3 py-2 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-md text-sm font-medium">
          {loading ? 'Scanning...' : 'Scan resume'}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold text-brand-700">{result.score}</div>
            <div className="text-sm text-gray-600">ATS-friendliness score (out of 100)</div>
          </div>

          <h4 className="font-semibold text-gray-900 mb-1">Recognized skills</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {result.skills.length > 0
              ? result.skills.map((s) => <span key={s} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{s}</span>)
              : <span className="text-sm text-gray-500">None detected — consider adding more specific skill keywords.</span>}
          </div>

          <h4 className="font-semibold text-gray-900 mb-1">Formatting checks</h4>
          <ul className="text-sm space-y-1">
            {result.formatting.map((c) => (
              <li key={c.label} className={c.pass ? 'text-green-700' : 'text-red-600'}>
                {c.pass ? '✓' : '✗'} {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
