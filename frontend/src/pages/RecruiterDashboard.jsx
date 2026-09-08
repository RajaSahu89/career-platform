import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecruiterDashboard() {
  const { auth } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '', tags: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState('');

  async function loadJobs() {
    const data = await api.myRecruiterJobs(auth.token);
    setJobs(data);
  }

  useEffect(() => { loadJobs(); }, []);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handlePost(e) {
    e.preventDefault();
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.postRecruiterJob({ ...form, tags }, auth.token);
      setMessage('Job posted.');
      setForm({ title: '', company: '', location: '', description: '', tags: '' });
      loadJobs();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function viewApplicants(job) {
    setSelectedJob(job);
    const data = await api.jobApplicants(job.id, auth.token);
    setApplicants(data);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Recruiter Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handlePost} className="bg-white border rounded-lg p-5 space-y-3 shadow-sm">
          <h3 className="font-semibold text-gray-900">Post a job</h3>
          <input required placeholder="Job title" value={form.title} onChange={(e) => update('title', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Company" value={form.company} onChange={(e) => update('company', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Location" value={form.location} onChange={(e) => update('location', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm" />
          <textarea required placeholder="Description" rows={5} value={form.description}
            onChange={(e) => update('description', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Tags (comma separated, e.g. react, remote)" value={form.tags}
            onChange={(e) => update('tags', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          {message && <p className="text-sm text-brand-700">{message}</p>}
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Post job
          </button>
        </form>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Your postings</h3>
          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="font-medium text-gray-900">{j.title}</p>
                <p className="text-sm text-gray-600">{j.location}</p>
                <button onClick={() => viewApplicants(j)} className="text-sm text-brand-600 underline mt-2">
                  View ranked applicants
                </button>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-sm text-gray-500">No jobs posted yet.</p>}
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">Applicants for "{selectedJob.title}" (ranked by match)</h3>
          <div className="space-y-2">
            {applicants.length === 0 && <p className="text-sm text-gray-500">No applicants yet.</p>}
            {applicants.map((a) => (
              <div key={a.id} className="bg-white border rounded-md p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-medium text-sm text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.email}</p>
                </div>
                <span className="text-sm font-semibold text-brand-700">{a.match_score ?? '—'}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
