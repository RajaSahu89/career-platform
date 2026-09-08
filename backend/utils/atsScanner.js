const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'react', 'vue', 'angular', 'node', 'express', 'next.js', 'redux',
  'html', 'css', 'tailwind', 'sass', 'bootstrap',
  'sql', 'postgresql', 'mysql', 'mongodb', 'sqlite', 'redis',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github',
  'rest api', 'graphql', 'microservices', 'agile', 'scrum',
  'machine learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch',
  'communication', 'leadership', 'project management', 'problem solving'
];

const STOPWORDS = new Set(['the','and','for','with','this','that','from','are','was','were','have','has',
  'you','your','our','their','will','can','able','a','an','of','to','in','on','at','as','is','be','it']);

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9+.#\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSkills(text) {
  const norm = normalize(text);
  return COMMON_SKILLS.filter(skill => norm.includes(skill));
}

function extractKeywords(text, limit = 40) {
  const norm = normalize(text);
  const words = norm.split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function formattingChecks(text) {
  const checks = [];
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{8,})/.test(text);
  const wordCount = text.trim().split(/\s+/).length;

  checks.push({ label: 'Contact email present', pass: hasEmail });
  checks.push({ label: 'Phone number present', pass: hasPhone });
  checks.push({ label: 'Resume length reasonable (150-1200 words)', pass: wordCount >= 150 && wordCount <= 1200 });
  checks.push({ label: 'Contains a skills/experience section', pass: /skills|experience/i.test(text) });
  return checks;
}

function scoreAgainstJob(resumeText, jobDescription) {
  const resumeSkills = new Set(extractSkills(resumeText));
  const jobSkills = new Set(extractSkills(jobDescription));
  const resumeKeywords = new Set(extractKeywords(resumeText, 60));
  const jobKeywords = extractKeywords(jobDescription, 60);

  let skillMatches = 0;
  jobSkills.forEach(s => { if (resumeSkills.has(s)) skillMatches++; });
  const skillScore = jobSkills.size > 0 ? (skillMatches / jobSkills.size) : 0.5;

  let keywordMatches = 0;
  jobKeywords.forEach(k => { if (resumeKeywords.has(k)) keywordMatches++; });
  const keywordScore = jobKeywords.length > 0 ? (keywordMatches / jobKeywords.length) : 0.5;

  const formatting = formattingChecks(resumeText);
  const formattingScore = formatting.filter(c => c.pass).length / formatting.length;

  const finalScore = Math.round((skillScore * 0.5 + keywordScore * 0.3 + formattingScore * 0.2) * 100);

  return {
    score: finalScore,
    matchedSkills: [...jobSkills].filter(s => resumeSkills.has(s)),
    missingSkills: [...jobSkills].filter(s => !resumeSkills.has(s)),
    formatting,
  };
}

function generalAtsScore(resumeText) {
  const skills = extractSkills(resumeText);
  const formatting = formattingChecks(resumeText);
  const formattingScore = formatting.filter(c => c.pass).length / formatting.length;
  const skillDensity = Math.min(skills.length / 10, 1); // up to 10 recognized skills = full marks
  const score = Math.round((formattingScore * 0.5 + skillDensity * 0.5) * 100);
  return { score, skills, formatting };
}

module.exports = { extractSkills, extractKeywords, scoreAgainstJob, generalAtsScore };
