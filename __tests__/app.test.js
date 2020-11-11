require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns to dos', async() => {

      const expectation = [
        {
          id: 1,
          todo: 'make the bed',
          completed: true,
        },
        {
          id: 2,
          todo: 'paint the dining room',
          completed: false,
        },
        {
          id: 3,
          todo: 'go to the store',
          completed: false,
        },
        {
          id: 4,
          todo: 'do the dishes',
          completed: true,
        },
        {
          id: 5,
          todo: 'rake the leaves',
          completed: false,
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
