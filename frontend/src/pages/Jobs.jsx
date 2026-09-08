import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Jobs() {
  const { auth } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [recs, setRecs] = useState(null);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingIndia, setSyncingIndia] = useState(false);

  async function loadJobs() {
    setLoading(true);
    try {
      const params = { q, location };
      if (country) params.country = country;
      const data = await api.listJobs(params);
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadJobs(); }, []); // eslint-disable-line

  async function handleSync() {
    setSyncing(true);
    try {
      await api.syncJobs();
      await loadJobs();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSyncIndia() {
    setSyncingIndia(true);
    try {
      const result = await api.syncIndiaJobs({ what: q || undefined, where: location || undefined });
      await loadJobs();
      if (result.error) alert(`${result.error}\n${result.detail || ''}`);
    } catch (err) {
      alert(`India job sync failed: ${err.message}`);
    } finally {
      setSyncingIndia(false);
    }
  }

  async function handleRecommend() {
    try {
      const data = await api.getRecommendations(auth.token);
      setRecs(data);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Keyword</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. React, Frontend"
            className="border rounded-md px-3 py-2 text-sm w-52" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote"
            className="border rounded-md px-3 py-2 text-sm w-40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-36">
            <option value="">All</option>
            <option value="IN">India</option>
            <option value="global">Global</option>
          </select>
        </div>
        <button onClick={loadJobs} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Search
        </button>
        <button onClick={handleSync} disabled={syncing} className="border px-4 py-2 rounded-md text-sm font-medium text-gray-700">
          {syncing ? 'Syncing...' : 'Sync latest jobs (free API)'}
        </button>
        <button onClick={handleSyncIndia} disabled={syncingIndia} className="border border-orange-400 text-orange-700 px-4 py-2 rounded-md text-sm font-medium">
          {syncingIndia ? 'Syncing...' : 'Sync India jobs'}
        </button>
        {auth && (
          <button onClick={handleRecommend} className="border border-brand-600 text-brand-700 px-4 py-2 rounded-md text-sm font-medium">
            Recommend jobs for my resume
          </button>
        )}
      </div>

      {recs && (
        <div className="mb-8 bg-brand-50 border border-brand-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Top matches for your resume</h3>
          <div className="space-y-2">
            {recs.map(({ job, score }) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="flex justify-between text-sm bg-white border rounded-md px-3 py-2 hover:border-brand-400">
                <span>{job.title} — {job.company}</span>
                <span className="font-medium text-brand-700">{score}% match</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No jobs cached yet — click "Sync latest jobs" to pull live listings from the free job board API.
        </p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="bg-white border rounded-lg p-4 hover:border-brand-400 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company} · {job.location}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {job.country === 'IN' ? '🇮🇳 India' : job.source}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
