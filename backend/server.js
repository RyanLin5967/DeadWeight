const express = require('express');
const cors = require('cors');
const analyze = require('./analyzer/index.js');
const { saveSnapshot, getSnapshots, getAllSites } = require('./store.js');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return res.status(400).json({ error: 'Please provide a valid URL starting with http:// or https://' });
  }

  try {
    const report = await analyze(url);
    res.json(report);
  } catch (err) {
    console.error('Analysis failed:', err.message);
    res.status(500).json({ error: 'Failed to analyze this site. It may have timed out or blocked automated access.' });
  }
});

app.post('/snapshot', (req, res) => {
  const { url, report } = req.body;
  if (!url || !report) {
    return res.status(400).json({ error: 'Missing url or report data' });
  }
  try {
    const siteData = saveSnapshot(url, report);
    res.json(siteData);
  } catch (err) {
    console.error('Snapshot save failed:', err.message);
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
});

app.get('/snapshots', (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  const data = getSnapshots(url);
  if (!data) {
    return res.json({ url, snapshots: [] });
  }
  res.json(data);
});

app.get('/sites', (req, res) => {
  res.json(getAllSites());
});

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});