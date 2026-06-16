/* FILE: portfolio/api/save-content.js */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Missing GitHub env variables.' });
  }

  let newData;
  try {
    newData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const branch  = GITHUB_BRANCH || 'main';
  const apiBase = `https://github.com{GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`;
  const headers = {
    Authorization:  `Bearer ${GITHUB_TOKEN}`,
    Accept:         'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  try {
    // FIX: Force clean utf-8 serialization to protect multi-byte characters and layout emojis
    const content = Buffer.from(JSON.stringify(newData, null, 2), 'utf-8').toString('base64');

    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    let sha;

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    } else if (getRes.status !== 404) {
      const err = await getRes.json();
      return res.status(500).json({ error: 'GitHub GET failed: ' + (err.message || getRes.status) });
    }

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'admin: update portfolio content via cloud dashboard',
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
};
