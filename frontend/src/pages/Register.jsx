import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      login(data);
      navigate('/jobs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Create your account</h2>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Full name" value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm" />
        <input type="email" required placeholder="Email" value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm" />
        <input type="password" required placeholder="Password" value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm" />
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" name="role" checked={form.role === 'seeker'} onChange={() => update('role', 'seeker')} />
            Job seeker
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="role" checked={form.role === 'recruiter'} onChange={() => update('role', 'recruiter')} />
            Recruiter
          </label>
        </div>
        <button disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md font-medium">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  );
}
