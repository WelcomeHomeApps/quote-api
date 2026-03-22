const request = require('supertest');
const app = require('../server');
const quotes = require('../data/quotes.json');

describe('GET /quotes', () => {
  it('returns 200 with all 10 quotes', async () => {
    const res = await request(app).get('/quotes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(10);
  });

  it('each quote has id, text, and author fields', async () => {
    const res = await request(app).get('/quotes');
    res.body.forEach((quote) => {
      expect(quote).toHaveProperty('id');
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
    });
  });
});

describe('GET /quote/random', () => {
  it('returns 200 with a single quote object', async () => {
    const res = await request(app).get('/quote/random');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('author');
  });

  it('returned quote exists in the quotes list', async () => {
    const res = await request(app).get('/quote/random');
    const ids = quotes.map((q) => q.id);
    expect(ids).toContain(res.body.id);
  });
});

describe('GET /quote/:id', () => {
  it('returns the correct quote for a valid id', async () => {
    const res = await request(app).get('/quote/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.author).toBe('Steve Jobs');
  });

  it('returns the last quote (id 10)', async () => {
    const res = await request(app).get('/quote/10');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(10);
    expect(res.body.author).toBe('Maya Angelou');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/quote/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 for id 0', async () => {
    const res = await request(app).get('/quote/0');
    expect(res.status).toBe(404);
  });
});
