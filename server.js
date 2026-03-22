const express = require('express');
const quotes = require('./data/quotes.json');

const app = express();
const PORT = 3000;

app.get('/quotes', (req, res) => {
  res.json(quotes);
});

app.get('/quote/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json(quotes[randomIndex]);
});

app.get('/quote/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const quote = quotes.find((q) => q.id === id);
  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }
  res.json(quote);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Quote of the Day API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
