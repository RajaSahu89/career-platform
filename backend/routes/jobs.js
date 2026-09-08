const express = require('express');
const db = require('../db/init');
const { authRequired } = require('../middleware/auth');
const { rankJobsForResume } = require('../utils/matcher');

const router = express.Router();
const JOB_API_URL = process.env.JOB_API_URL || 'https://www.arbeitnow.com/api/job-board-api';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

router.post('/sync', async (req, res) => {
  try {
    const response = await fetch(JOB_API_URL);
    if (!response.ok) throw new Error(`Job API responded with ${response.status}`);
    const data = await response.json();

    const insert = db.prepare(`
      INSERT INTO jobs (external_id, source, title, company, location, country, description, tags, url)
      VALUES (@external_id, 'external', @title, @company, @location, 'global', @description, @tags, @url)
      ON CONFLICT(external_id) DO UPDATE SET
        title=excluded.title, company=excluded.company, location=excluded.location,
        description=excluded.description, tags=excluded.tags, url=excluded.url
    `);

    const jobsToInsert = data.data || [];
    db.exec('BEGIN');
    try {
      for (const j of jobsToInsert) {
        insert.run({
          external_id: j.slug || j.url,
          title: j.title,
          company: j.company_name,
          location: (j.location || 'Remote'),
          description: (j.description || '').replace(/<[^>]+>/g, ' ').slice(0, 5000),
          tags: JSON.stringify(j.tags || []),
          url: j.url,
        });
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    res.json({ synced: jobsToInsert.length });
  } catch (err) {
    res.status(502).json({ error: 'Failed to sync jobs from free job board API', detail: err.message });
  }
});

router.post('/sync-india', async (req, res) => {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return res.status(400).json({
      error: 'Adzuna API credentials not configured',
      detail: 'Sign up free at https://developer.adzuna.com/ and set ADZUNA_APP_ID and ADZUNA_APP_KEY in backend/.env',
    });
  }

  const { what, where, page } = req.body || {};
  const pageNum = page || 1;
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '50',
    'content-type': 'application/json',
  });
  if (what) params.set('what', what);
  if (where) params.set('where', where);

  const url = `https://api.adzuna.com/v1/api/jobs/in/search/${pageNum}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Adzuna API responded with ${response.status}`);
    const data = await response.json();
    const results = data.results || [];

    const insert = db.prepare(`
      INSERT INTO jobs (external_id, source, title, company, location, country, description, tags, url)
      VALUES (@external_id, 'external', @title, @company, @location, 'IN', @description, @tags, @url)
      ON CONFLICT(external_id) DO UPDATE SET
        title=excluded.title, company=excluded.company, location=excluded.location,
        description=excluded.description, tags=excluded.tags, url=excluded.url
    `);

    db.exec('BEGIN');
    try {
      for (const j of results) {
        insert.run({
          external_id: `adzuna-${j.id}`,
          title: j.title,
          company: j.company && j.company.display_name,
          location: (j.location && j.location.display_name) || 'India',
          description: (j.description || '').slice(0, 5000),
          tags: JSON.stringify(j.category ? [j.category.label] : []),
          url: j.redirect_url,
        });
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    res.json({ synced: results.length });
  } catch (err) {
    res.status(502).json({ error: 'Failed to sync India jobs from Adzuna', detail: err.message });
  }
});

router.get('/', (req, res) => {
  const { q, location, country } = req.query;
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  if (q) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }
  if (country) {
    sql += ' AND country = ?';
    params.push(country);
  }
  sql += ' ORDER BY created_at DESC LIMIT 100';
  const jobs = db.prepare(sql).all(...params);
  res.json(jobs);
});

router.get('/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

router.get('/recommendations/for-me', authRequired, (req, res) => {
  const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  if (!resume) return res.status(400).json({ error: 'Upload a resume first to get recommendations' });

  const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 300').all();
  const ranked = rankJobsForResume(resume.raw_text, jobs).slice(0, 20);
  res.json(ranked);
});

module.exports = router;
