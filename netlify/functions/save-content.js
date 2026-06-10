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
  const runtimeFetch = typeof fetch === 'function' ? fetch : null;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing GitHub env variables. Check Netlify site settings.' }),
    };
  }

  if (!runtimeFetch) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fetch is not available in this runtime environment.' }),
    };
  }

  let newData;
  try {
    if (!event.body || event.body.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Empty request body — make sure all admin tabs have loaded before saving.' }) };
    }
    newData = JSON.parse(event.body);
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body — could not parse request.', details: error.message }) };
  }

  const branch   = GITHUB_BRANCH || 'main';
  const filePath = 'data.json';
  const apiBase  = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const headers  = {
    Authorization:  `Bearer ${GITHUB_TOKEN}`,
    Accept:         'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  try {
    const content = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');

    // Step 1: Try to get current file SHA
    // If file doesn't exist yet (404), we create it fresh
    const getRes = await runtimeFetch(`${apiBase}?ref=${branch}`, { headers });
    let sha = undefined;

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    } else if (getRes.status === 404) {
      // File doesn't exist yet — we'll create it (no sha needed)
      sha = undefined;
    } else {
      const err = await getRes.json();
      return { statusCode: 500, body: JSON.stringify({ error: 'GitHub GET failed: ' + (err.message || getRes.status) }) };
    }

    // Step 2: Create or update the file
    const putBody = {
      message: 'admin: update portfolio content',
      content,
      branch,
      ...(sha ? { sha } : {}), // only include sha if updating existing file
    };

    const putRes = await runtimeFetch(apiBase, {
      method:  'PUT',
      headers,
      body:    JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return { statusCode: 500, body: JSON.stringify({ error: 'GitHub PUT failed: ' + (err.message || putRes.status) }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};