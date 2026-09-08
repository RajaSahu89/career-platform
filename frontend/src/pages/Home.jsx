import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { title: 'Job Matching', desc: 'Live listings pulled from a free job board API, searchable by title and location.' },
  { title: 'ATS Resume Scanner', desc: 'Paste your resume and get an ATS-friendliness score, matched skills, and formatting checks.' },
  { title: 'Application Tracker', desc: 'Track every application from applied to offer, with computed resume-to-job match scores.' },
  { title: 'Interview Tracker', desc: 'Schedule and log interview rounds tied to each application.' },
  { title: 'Recruiter Dashboard', desc: 'Post jobs and see applicants ranked automatically by resume match.' },
  { title: 'AI Career Recommendations', desc: 'Local similarity-based ranking surfaces the jobs that best fit your resume.' },
];

export default function Home() {
  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CareerPilot</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A free, open-source job & career platform: matching, ATS scanning, application
          tracking, and recruiter tools — all in one place.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/jobs" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-md font-medium">
            Browse Jobs
          </Link>
          <Link to="/register" className="border border-brand-600 text-brand-700 px-5 py-2.5 rounded-md font-medium">
            Get Started
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {features.map((f) => (
          <div key={f.title} className="bg-white border rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
