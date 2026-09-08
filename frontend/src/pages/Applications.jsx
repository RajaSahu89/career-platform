import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const STAGES = ['applied', 'interview', 'offer', 'rejected'];
const STAGE_LABEL = { applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected' };

export default function Applications() {
  const { auth } = useAuth();
  const [apps, setApps] = useState([]);

  async function load() {
    const data = await api.myApplications(auth.token);
    setApps(data);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function moveStage(id, status) {
    await api.updateApplicationStatus(id, status, auth.token);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">My Applications</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-gray-100 rounded-lg p-3">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">{STAGE_LABEL[stage]}</h3>
            <div className="space-y-3">
              {apps.filter((a) => a.status === stage).map((a) => (
                <div key={a.id} className="bg-white border rounded-md p-3 shadow-sm">
                  <p className="font-medium text-sm text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{a.company}</p>
                  {a.match_score != null && (
                    <p className="text-xs text-brand-700 mb-2">Match: {a.match_score}%</p>
                  )}
                  <select value={a.status} onChange={(e) => moveStage(a.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1 w-full">
                    {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                  </select>
                </div>
              ))}
              {apps.filter((a) => a.status === stage).length === 0 && (
                <p className="text-xs text-gray-400">No applications</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
