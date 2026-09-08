const express = require('express');
const db = require('../db/init');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function ownsApplication(userId, applicationId) {
  return db.prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?').get(applicationId, userId);
}

router.post('/', authRequired, (req, res) => {
  const { application_id, round_name, scheduled_at, interviewer, notes } = req.body;
  if (!ownsApplication(req.user.id, application_id)) {
    return res.status(403).json({ error: 'Not your application' });
  }
  const info = db.prepare(`
    INSERT INTO interviews (application_id, round_name, scheduled_at, interviewer, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(application_id, round_name, scheduled_at, interviewer, notes);

  db.prepare("UPDATE applications SET status = 'interview', updated_at = datetime('now') WHERE id = ?").run(application_id);
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)')
    .run(req.user.id, `Interview scheduled: ${round_name || 'Round'} on ${scheduled_at || 'TBD'}.`);

  res.status(201).json({ id: info.lastInsertRowid });
});

router.get('/', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT interviews.*, applications.job_id, jobs.title, jobs.company
    FROM interviews
    JOIN applications ON interviews.application_id = applications.id
    JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.user_id = ?
    ORDER BY interviews.scheduled_at ASC
  `).all(req.user.id);
  res.json(rows);
});

router.patch('/:id', authRequired, (req, res) => {
  const { status, notes, scheduled_at } = req.body;
  const row = db.prepare(`
    SELECT interviews.id FROM interviews
    JOIN applications ON interviews.application_id = applications.id
    WHERE interviews.id = ? AND applications.user_id = ?
  `).get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Interview not found' });

  db.prepare('UPDATE interviews SET status = COALESCE(?, status), notes = COALESCE(?, notes), scheduled_at = COALESCE(?, scheduled_at) WHERE id = ?')
    .run(status, notes, scheduled_at, req.params.id);
  res.json({ updated: true });
});

module.exports = router;
