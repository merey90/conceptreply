const express = require('express');
const createError = require('http-errors');

const router = express.Router();

const db = require('./../server/db');
const parseTimestampPG = require('./../server/utils');

router.get('/', function(req, res, next) {
  db.any('SELECT * FROM demands')
  .then((demands) => {
    res.send(demands);
  })
  .catch((error) => {
    next(createError(error));
  });
  
});

router.get('/:id', function(req, res, next) {
  db.one(`SELECT * FROM demands WHERE id = ${req.params.id}`)
  .then((demand) => {
    res.send(demand);
  })
  .catch((error) => {
    console.log(error);
    next(createError(error));
  });
});

router.post('/', function(req, res, next) {
  let demand = req.body;
  // Check if user exists in db
  db.one(`SELECT * FROM users WHERE id = ${demand.users}`)
  .then((user) => {
    // Save demand in db
    db.one(`INSERT INTO demands(pick_lat,
                                pick_long,
                                pick_time,
                                drop_lat,
                                drop_long,
                                drop_time,
                                infotaintment_systems,
                                interior_design,
                                engine,
                                users) 
                          VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                          RETURNING id`,
                          [ demand.pick_lat,
                            demand.pick_long,
                            parseTimestampPG(demand.pick_time),
                            demand.drop_lat,
                            demand.drop_long,
                            parseTimestampPG(demand.drop_time),
                            demand.infotaintment_systems,
                            demand.interior_design,
                            demand.engine,
                            demand.users
                          ])
    .then(newdemand => {
      res.send(newdemand.id);
    })
    .catch(error => { // demand not saved
      next(createError(error));
    });
  })
  .catch((error) => { // No user found
    next(createError(error));
  });
});

router.put('/:id', function(req, res, next) {
  let demand = req.body;
  // Check if user exists in db
  db.one(`SELECT * FROM users WHERE id = ${demand.users}`)
  .then((user) => {
    // TODO: Check demand params for null and undefined
    // updating demands
    db.result(`UPDATE demands SET
                              pick_lat = $1,
                              pick_long = $2,
                              pick_time = $3,
                              drop_lat = $4,
                              drop_long = $5,
                              drop_time = $6,
                              infotaintment_systems = $7,
                              interior_design = $8,
                              engine = $9,
                              users = $10
                            WHERE id = ${req.params.id}`,
                      [ demand.pick_lat,
                        demand.pick_long,
                        parseTimestampPG(demand.pick_time),
                        demand.drop_lat,
                        demand.drop_long,
                        parseTimestampPG(demand.drop_time),
                        demand.infotaintment_systems,
                        demand.interior_design,
                        demand.engine,
                        demand.users
                      ])
    .then(result => {
      res.send('updated demands: '+result.rowCount);
    })
    .catch(error => {
      next(createError(error));
    });
  })
  .catch((error) => { // No user found
    next(createError(error));
  });
});

router.delete('/:id', function(req, res, next) {
  db.result(`DELETE FROM demands WHERE id = ${req.params.id}`)
  .then(result => {
    res.send('removed demands: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

module.exports = router;
