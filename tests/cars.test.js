process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

const db = require('../server/db');

chai.use(chaiHttp);

describe('Cars', () => {
  /**
   * truncate table cars before each test and fill wich mocks
   */
  beforeEach(function(done){
    db.result('TRUNCATE TABLE cars CASCADE')
      .then((result)=>{
          db.result(`INSERT INTO cars (title,
                                    brand,
                                    engine,
                                    infotaintment_systems,
                                    interior_design,
                                    location_lat,
                                    location_long)
                         VALUES ('320', 'BMW', 1, [1,2,3], 1, 1, 1),
                                ('330', 'Lexus', 2, [1,2,5], 1, 10, 10)`)
            .then((result2)=>{
            })
            .catche(error => console.log(error));
      })
      .catche(error => {
          console.log(error);
      });
  });

  /**
   * Test for get
   */
  describe('/GET cars', () => {
    it('it should GET all the cars', (done) => {
      chai.request(app)
      .get('/cars')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(2);
        done();
      });
    });
  });
});