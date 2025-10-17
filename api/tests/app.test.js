// tests/app.test.js
const request = require('supertest');
const app = require('../app.js').default; // <-- Note the .default

describe('Basic API Test', () => {
  it('should return 404 for the root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(404);
  });
});