const BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  syncJobs: () => request('/jobs/sync', { method: 'POST' }),
  syncIndiaJobs: (payload = {}) => request('/jobs/sync-india', { method: 'POST', body: payload }),
  listJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/jobs${qs ? `?${qs}` : ''}`);
  },
  getJob: (id) => request(`/jobs/${id}`),
  getRecommendations: (token) => request('/jobs/recommendations/for-me', { token }),

  uploadResume: (text, token) => request('/resume', { method: 'POST', body: { text }, token }),
  myResumes: (token) => request('/resume/mine', { token }),
  scoreAgainstJob: (jobId, token) => request(`/resume/score-against/${jobId}`, { token }),

  apply: (job_id, notes, token) => request('/applications', { method: 'POST', body: { job_id, notes }, token }),
  myApplications: (token) => request('/applications', { token }),
  updateApplicationStatus: (id, status, token) =>
    request(`/applications/${id}/status`, { method: 'PATCH', body: { status }, token }),

  scheduleInterview: (payload, token) => request('/interviews', { method: 'POST', body: payload, token }),
  myInterviews: (token) => request('/interviews', { token }),

  postRecruiterJob: (payload, token) => request('/recruiter/jobs', { method: 'POST', body: payload, token }),
  myRecruiterJobs: (token) => request('/recruiter/jobs', { token }),
  jobApplicants: (jobId, token) => request(`/recruiter/jobs/${jobId}/applicants`, { token }),

  myNotifications: (token) => request('/notifications', { token }),
};
