/* FILE: api/save-content.js — ENVIRONMENT SECURITY RUNTIME */
const { Octokit } = require("@octokit/rest");

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // FIXED: Reads tokens safely from Vercel's environment variables to prevent token revocation blocks
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "Lague23Ceejay";
  const repo  = process.env.GITHUB_REPO || "portfolio";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    return res.status(500).json({ ok: false, error: "System Error: GITHUB_TOKEN is not configured." });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const filePath = 'data.json';

    let sha = null;
    try {
      const currentFile = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch
      });
      sha = currentFile.data.sha;
    } catch (e) {
      sha = null;
    }

    const contentBuffer = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
    
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'data: secure content engine updates sync',
      content: contentBuffer,
      sha,
      branch
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("CRITICAL BACKEND EXCEPTION ENCOUNTERED:", error);
    return res.status(500).json({ 
      ok: false, 
      error: `GitHub API Mutation Error: ${error.message || 'Unknown network crash'}` 
    });
  }
};
