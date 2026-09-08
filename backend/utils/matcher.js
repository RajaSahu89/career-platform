const { extractKeywords } = require('./atsScanner');

function termFrequency(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => { tf[k] = tf[k] / total; });
  return tf;
}

function cosineSim(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  keys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Rank a list of jobs against a resume's text using TF-based cosine similarity.
 * @param {string} resumeText
 * @param {Array<{id:number, title:string, description:string, tags:string}>} jobs
 * @returns {Array<{job, score:number}>} sorted descending by score
 */
function rankJobsForResume(resumeText, jobs) {
  const resumeTokens = extractKeywords(resumeText, 100);
  const resumeVec = termFrequency(resumeTokens);

  const ranked = jobs.map(job => {
    const jobText = `${job.title} ${job.description || ''} ${job.tags || ''}`;
    const jobTokens = extractKeywords(jobText, 100);
    const jobVec = termFrequency(jobTokens);
    const score = cosineSim(resumeVec, jobVec);
    return { job, score: Math.round(score * 100) };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

module.exports = { rankJobsForResume, cosineSim, termFrequency };
