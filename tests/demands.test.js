process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

const db = require('../server/db');

chai.use(chaiHttp);

describe('Demands', () => {
  /**
   * truncate table users and demands before each test and fill wich mocks
   */
  beforeEach(function(done){
    db.result('TRUNCATE TABLE demands CASCADE')
      .then((result)=>{
        db.result('TRUNCATE TABLE users CASCADE')
        .then((result2)=>{
          db.result(`INSERT INTO users (name, gender, age)
          VALUES ('Merey', 'male', 28)`)
          .then((result3)=>{
          })
          .catche(error => console.log(error));
        })
        .catche(error => console.log(error));
      })
      .catche(error => {
          console.log(error);
      });
  });

  /**
   * Test for post
   */
  describe('/Post demand', () => {
    it('it should return id of new demand', (done) => {
      let demand1 = {
        "pick_lat":15,
        "pick_long":15,
        "pick_time":1535362007612,
        "drop_lat":40,
        "drop_long":40,
        "drop_time":1535366007612,
        "engine":1,
        "infotaintment_systems":[1,3,4,5],
        "interior_design":2,
        "users":1
      };
      let demand2 = {
        "pick_lat":15,
        "pick_long":15,
        "pick_time":1535362007612,
        "drop_lat":40,
        "drop_long":40,
        "drop_time":1535366007612,
        "engine":1,
        "infotaintment_systems":[1,3,4,5],
        "interior_design":2,
        "users":2
      };
      chai.request(app)
      .post('/demands')
      .send(demand1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql(1);
        done();
      });
    });

    it('it should return error with no user found', (done) => {
      chai.request(app)
      .post('/demands')
      .send(demand2)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    });

    // TODO: test case for missing demand params
  });
});