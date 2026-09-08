import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Interviews() {
  const { auth } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState({ application_id: '', round_name: '', scheduled_at: '', interviewer: '', notes: '' });
  const [message, setMessage] = useState('');

  async function load() {
    const [i, a] = await Promise.all([api.myInterviews(auth.token), api.myApplications(auth.token)]);
    setInterviews(i);
    setApps(a);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.scheduleInterview({ ...form, application_id: Number(form.application_id) }, auth.token);
      setMessage('Interview scheduled.');
      setForm({ application_id: '', round_name: '', scheduled_at: '', interviewer: '', notes: '' });
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule an Interview</h2>
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-5 space-y-3 shadow-sm">
          <select required value={form.application_id} onChange={(e) => update('application_id', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Select an application...</option>
            {apps.map((a) => <option key={a.id} value={a.id}>{a.title} — {a.company}</option>)}
          </select>
          <input placeholder="Round name (e.g. Technical Screen)" value={form.round_name}
            onChange={(e) => update('round_name', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          <input type="datetime-local" value={form.scheduled_at}
            onChange={(e) => update('scheduled_at', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Interviewer name" value={form.interviewer}
            onChange={(e) => update('interviewer', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          <textarea placeholder="Notes" value={form.notes} rows={3}
            onChange={(e) => update('notes', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          {message && <p className="text-sm text-brand-700">{message}</p>}
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Schedule
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming & Past Interviews</h2>
        <div className="space-y-3">
          {interviews.length === 0 && <p className="text-sm text-gray-500">No interviews scheduled yet.</p>}
          {interviews.map((i) => (
            <div key={i.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="font-medium text-gray-900">{i.round_name || 'Interview'} — {i.title}</p>
              <p className="text-sm text-gray-600">{i.company}</p>
              <p className="text-xs text-gray-500 mt-1">
                {i.scheduled_at ? new Date(i.scheduled_at).toLocaleString() : 'Time TBD'} · {i.interviewer || 'Interviewer TBD'}
              </p>
              <span className="text-xs inline-block mt-2 bg-gray-100 px-2 py-1 rounded-full">{i.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
