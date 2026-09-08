const express = require('express');
const db = require('../db/init');
const { authRequired } = require('../middleware/auth');
const { extractSkills, generalAtsScore, scoreAgainstJob } = require('../utils/atsScanner');

const router = express.Router();

router.post('/', authRequired, (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 30) {
    return res.status(400).json({ error: 'Paste your resume text (min ~30 characters)' });
  }
  const { score, skills, formatting } = generalAtsScore(text);
  const info = db.prepare(
    'INSERT INTO resumes (user_id, raw_text, skills, ats_score) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, text, JSON.stringify(skills), score);

  res.status(201).json({ id: info.lastInsertRowid, score, skills, formatting });
});

router.get('/mine', authRequired, (req, res) => {
  const resumes = db.prepare('SELECT id, ats_score, skills, created_at FROM resumes WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(resumes.map(r => ({ ...r, skills: JSON.parse(r.skills || '[]') })));
});


router.get('/score-against/:jobId', authRequired, (req, res) => {
  const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  if (!resume) return res.status(400).json({ error: 'Upload a resume first' });

  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const result = scoreAgainstJob(resume.raw_text, job.description || job.title);
  res.json(result);
});

module.exports = router;
