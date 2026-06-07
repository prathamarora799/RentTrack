import request from 'supertest'
import app from '../index'

describe('RentTrack Tests', () => {

  // Test 1 — Register
  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: '123456',
        role: 'tenant'
      })
    expect(res.status).toBe(201)
  })

  // Test 2 — Login
  test('Login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@test.com',
        password: '123456'
      })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  // Test 3 — Login wrong password
  test('Login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@test.com',
        password: 'wrongpass'
      })
    expect(res.status).toBe(400)
  })

})