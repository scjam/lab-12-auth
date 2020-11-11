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

    test('tests get and post', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'make the bed',
          completed: false,
          owner_id: 2
        },
        {
          id: 5,
          todo: 'paint the dining room',
          completed: false,
          owner_id: 2
        },
        {
          id: 6,
          todo: 'go to the store',
          completed: false,
          owner_id: 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'make the bed',
          completed: false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'paint the dining room',
          completed: false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const res = await fakeRequest(app)
        .post('/api/todos')
        .send({
          todo: 'go to the store',
          completed: false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(res.body).toEqual({
        id: 6,
        todo: 'go to the store',
        completed: false,
        owner_id: 2
      });
    });

    test('updates one todo', async() => {
      const expectation = 
        {
          id: 4,
          todo: 'make the bed',
          completed: false,
          owner_id: 2 
        };

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectation);
    });
  });
});
