const express = require('express');
const db = require('../db/init');
const { authRequired } = require('../middleware/auth');
const { scoreAgainstJob } = require('../utils/atsScanner');

const router = express.Router();

router.post('/', authRequired, (req, res) => {
  const { job_id, notes } = req.body;
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(job_id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  let matchScore = null;
  if (resume) {
    matchScore = scoreAgainstJob(resume.raw_text, job.description || job.title).score;
  }

  const info = db.prepare(
    'INSERT INTO applications (user_id, job_id, match_score, notes) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, job_id, matchScore, notes || null);

  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)')
    .run(req.user.id, `Application submitted for ${job.title} at ${job.company || 'the company'}.`);

  res.status(201).json({ id: info.lastInsertRowid, match_score: matchScore });
});

router.get('/', authRequired, (req, res) => {
  const apps = db.prepare(`
    SELECT applications.*, jobs.title, jobs.company, jobs.location
    FROM applications JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.user_id = ?
    ORDER BY applications.applied_at DESC
  `).all(req.user.id);
  res.json(apps);
});

router.patch('/:id/status', authRequired, (req, res) => {
  const { status } = req.body;
  const allowed = ['applied', 'interview', 'offer', 'rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });

  const app = db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  db.prepare("UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)')
    .run(req.user.id, `Application status updated to "${status}".`);

  res.json({ updated: true });
});

module.exports = router;
