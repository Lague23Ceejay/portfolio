/* FILE: portfolio/api/save-content.js */

/* ============================================================
   save-content.js — Vercel Serverless Function
   Receives updated data.json content from the admin panel
   and commits it to your GitHub repo via the GitHub API.

   SETUP (one-time, in Vercel dashboard):
   Project → Settings → Environment Variables → Add:

     GITHUB_TOKEN   → your GitHub personal access token
                      Needs: Contents read & write on your portfolio repo

     GITHUB_OWNER   → your GitHub username (e.g. Lague23Ceejay)
     GITHUB_REPO    → your repo name       (e.g. portfolio)
     GITHUB_BRANCH  → main
   ============================================================ */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({
      error: 'Missing GitHub env variables. Check Vercel project settings.'
    });
  }

  let newData;
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Empty request body.' });
    }
    newData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const branch  = GITHUB_BRANCH || 'main';
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`;
  const headers = {
    Authorization:  `Bearer ${GITHUB_TOKEN}`,
    Accept:         'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  try {
    const content = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');

    // Step 1: Get current file SHA (or create fresh if missing)
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    let sha;

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    } else if (getRes.status === 404) {
      sha = undefined; // file doesn't exist yet, will be created
    } else {
      const err = await getRes.json();
      return res.status(500).json({ error: 'GitHub GET failed: ' + (err.message || getRes.status) });
    }

    // Step 2: Commit the updated data.json
    const putRes = await fetch(apiBase, {
      method:  'PUT',
      headers,
      body: JSON.stringify({
        message: 'admin: update portfolio content',
        content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: 'GitHub PUT failed: ' + (err.message || putRes.status) });
    }

    return res.status(200).json({ ok: true });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}