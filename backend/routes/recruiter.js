const express = require('express');
const db = require('../db/init');
const { authRequired, requireRole } = require('../middleware/auth');
const { scoreAgainstJob } = require('../utils/atsScanner');

const router = express.Router();

router.use(authRequired, requireRole('recruiter'));

router.post('/jobs', (req, res) => {
  const { title, company, location, description, tags } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'title and description are required' });

  const info = db.prepare(`
    INSERT INTO jobs (source, recruiter_id, title, company, location, description, tags)
    VALUES ('recruiter', ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title, company, location, description, JSON.stringify(tags || []));

  res.status(201).json({ id: info.lastInsertRowid });
});

router.get('/jobs', (req, res) => {
  const jobs = db.prepare("SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(jobs);
});

router.get('/jobs/:id/applicants', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?').get(req.params.id, req.user.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const applicants = db.prepare(`
    SELECT applications.*, users.name, users.email
    FROM applications
    JOIN users ON applications.user_id = users.id
    WHERE applications.job_id = ?
  `).all(req.params.id);

  const ranked = applicants.map(a => {
    const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(a.user_id);
    const freshScore = resume ? scoreAgainstJob(resume.raw_text, job.description).score : a.match_score;
    return { ...a, match_score: freshScore };
  }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  res.json(ranked);
});

module.exports = router;
