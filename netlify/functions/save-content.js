/* FILE: portfolio/netlify/functions/save-content.js */

/* ============================================================
   save-content.js — Netlify Serverless Function
   Receives updated data.json content from the admin panel
   and commits it to your GitHub repo via the GitHub API.

   SETUP (one-time, in Netlify dashboard):
   Site settings → Environment variables → Add:

     GITHUB_TOKEN   → your GitHub personal access token
                      (Settings → Developer settings → PAT → Fine-grained)
                      Needs: Contents read & write on your portfolio repo

     GITHUB_OWNER   → your GitHub username (e.g. christianjohnlague)
     GITHUB_REPO    → your repo name       (e.g. portfolio)
     GITHUB_BRANCH  → usually "main"
   ============================================================ */

exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing GitHub env variables. Check Netlify site settings.' }),
    };
  }

  let newData;
  try {
    newData = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const branch   = GITHUB_BRANCH || 'main';
  const filePath = 'data.json';
  const apiBase  = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    // Step 1: Get current file SHA (required by GitHub API to update a file)
    const getRes  = await fetch(`${apiBase}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept:        'application/vnd.github+json',
      },
    });

    if (!getRes.ok) {
      const err = await getRes.json();
      return { statusCode: 500, body: JSON.stringify({ error: 'GitHub GET failed: ' + err.message }) };
    }

    const fileInfo = await getRes.json();
    const sha      = fileInfo.sha;

    // Step 2: Commit the updated data.json
    const content  = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');
    const putRes   = await fetch(apiBase, {
      method:  'PUT',
      headers: {
        Authorization:  `Bearer ${GITHUB_TOKEN}`,
        Accept:         'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'admin: update portfolio content',
        content,
        sha,
        branch,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return { statusCode: 500, body: JSON.stringify({ error: 'GitHub PUT failed: ' + err.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};