const express = require('express');
const cors = require('cors');
const analyze = require('./analyzer/index.js');

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

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});