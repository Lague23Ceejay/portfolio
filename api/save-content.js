/* FILE: api/save-content.js — PRODUCTION DYNAMIC IMPORT COMPATIBLE RUNTIME */

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

  // FIXED: Dynamically import Octokit inside the async handler loop to satisfy Node's modern ESM engine rules
  let Octokit;
  try {
    const octokitModule = await import("@octokit/rest");
    Octokit = octokitModule.Octokit;
  } catch (err) {
    console.error("FAILED TO LOAD DYNAMIC OCTOKIT MODULE:", err);
    return res.status(500).json({ ok: false, error: "System Error: Missing core library files." });
  }

  // Secure environmental configuration mapping
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "Lague23Ceejay";
  const repo  = process.env.GITHUB_REPO || "portfolio";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    return res.status(500).json({ ok: false, error: "System Error: GITHUB_TOKEN environment variable is not configured." });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const filePath = 'data.json';

    // 1. Fetch the remote file reference token properties from GitHub upstream branches
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
      sha = null; // Valid if data.json doesn't exist yet in the repo branch logs
    }

    // 2. Encode your client browser state payload into structured base64 binaries
    const contentBuffer = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
    
    // 3. Force commit the package update down into your remote master branch history
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'data: secure content engine dynamic updates synchronization commit',
      content: contentBuffer,
      sha,
      branch
    });

    // Send clean JSON success coordinates back to front-end browser listeners
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("CRITICAL BACKEND OPERATION EXCEPTION ENCOUNTERED:", error);
    return res.status(500).json({ 
      ok: false, 
      error: `GitHub API Mutation Error: ${error.message || 'Unknown network crash'}` 
    });
  }
};
