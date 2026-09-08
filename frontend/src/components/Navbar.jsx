import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkCls = 'text-sm font-medium text-gray-600 hover:text-brand-600';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-brand-700 text-lg">CareerPilot</Link>
        <div className="flex items-center gap-5">
          <Link to="/jobs" className={linkCls}>Jobs</Link>
          {auth && <Link to="/resume" className={linkCls}>ATS Scanner</Link>}
          {auth && <Link to="/applications" className={linkCls}>Applications</Link>}
          {auth && <Link to="/interviews" className={linkCls}>Interviews</Link>}
          {auth?.user.role === 'recruiter' && <Link to="/recruiter" className={linkCls}>Recruiter</Link>}
          {auth && <Link to="/notifications" className={linkCls}>Notifications</Link>}

          {auth ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-md"
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className={linkCls}>Log in</Link>
              <Link to="/register" className="text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-md">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
