/* FILE: api/save-content.js — PRODUCTION COMMONJS COMPATIBLE RUNTIME */
const { Octokit } = require("@octokit/rest");

module.exports = async function handler(req, res) {
  // Handle cross-origin preflight checks
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Hardcoded direct authentication parameters to bypass environment parser bugs
  const token = "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";
  const owner = "Lague23Ceejay";
  const repo  = "portfolio";
  const branch = "main";

  try {
    const octokit = new Octokit({ auth: token });
    const filePath = 'data.json';

    // 1. Look up the existing remote file SHA token from GitHub upstream tracking branches
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
      sha = null; // Valid if the file does not exist yet in the repo history
    }

    // 2. Encode our browser payload data state bundle into clean Base64 binaries
    const contentBuffer = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
    
    // 3. Force commit directly down into your master remote branch history
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'data: secure content engine dynamic updates synchronization commit',
      content: contentBuffer,
      sha,
      branch
    });

    // Send a valid, structured JSON object response back to front-end admin dashboard listeners
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("CRITICAL BACKEND EXCEPTION ENCOUNTERED:", error);
    return res.status(500).json({ 
      ok: false, 
      error: `GitHub API Mutation Error: ${error.message || 'Unknown network crash'}` 
    });
  }
};
