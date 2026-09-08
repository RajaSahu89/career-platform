import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getJob(id).then(setJob);
  }, [id]);

  async function handleCheckMatch() {
    try {
      const data = await api.scoreAgainstJob(id, auth.token);
      setMatchInfo(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleApply() {
    setApplying(true);
    try {
      await api.apply(Number(id), '', auth.token);
      setMessage('Application submitted! Track it from the Applications page.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setApplying(false);
    }
  }

  if (!job) return <p className="text-sm text-gray-500">Loading...</p>;

  const tags = (() => { try { return JSON.parse(job.tags || '[]'); } catch { return []; } })();

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
      <p className="text-gray-600 mb-4">{job.company} · {job.location}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t) => <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{t}</span>)}
        </div>
      )}

      <p className="text-sm text-gray-700 whitespace-pre-line mb-6">{job.description}</p>

      {job.url && (
        <a href={job.url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 underline block mb-4">
          View original listing
        </a>
      )}

      {message && <p className="text-sm text-brand-700 mb-3">{message}</p>}

      {auth ? (
        <div className="flex gap-3">
          <button onClick={handleApply} disabled={applying}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            {applying ? 'Applying...' : 'Apply now'}
          </button>
          <button onClick={handleCheckMatch}
            className="border px-4 py-2 rounded-md text-sm font-medium text-gray-700">
            Check my ATS match
          </button>
        </div>
      ) : (
        <button onClick={() => navigate('/login')} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium">
          Log in to apply
        </button>
      )}

      {matchInfo && (
        <div className="mt-5 bg-gray-50 border rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">Match score: {matchInfo.score}%</p>
          <p className="text-sm text-green-700 mb-1">Matched: {matchInfo.matchedSkills.join(', ') || 'none'}</p>
          <p className="text-sm text-red-600">Missing: {matchInfo.missingSkills.join(', ') || 'none'}</p>
        </div>
      )}
    </div>
  );
}
