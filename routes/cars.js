const express = require('express');
const createError = require('http-errors');
const router = express.Router();

const db = require('./../server/db');

router.get('/', function(req, res, next) {
  db.any('SELECT * FROM cars')
  .then((cars) => {
    res.send(cars);
  })
  .catch((error) => {
    next(createError(error));
  });
  
});

router.get('/:id', function(req, res, next) {
  db.one(`SELECT * FROM cars WHERE id = ${req.params.id}`)
  .then((car) => {
    res.send(car);
  })
  .catch((error) => {
    next(createError(error));
  });
});

router.post('/', function(req, res, next) {
  let car = req.body; 
  db.one(`INSERT INTO cars( title,
                            brand,
                            engine,
                            infotaintment_systems,
                            interior_design,
                            location_lat,
                            location_long) 
                    VALUES( $1, $2, $3, $4, $5, $6, $7)
                    RETURNING id`,
                    [ car.title,
                      car.brand,
                      car.engine,
                      car.infotaintment_systems,
                      car.interior_design,
                      car.location_lat,
                      car.location_long
                    ])
  .then(newCar => {
    res.send(newCar.id);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.put('/:id', function(req, res, next) {
  let car = req.body;

  // TODO: Check car params for null and undefined
  db.result(`UPDATE cars SET
                        title = $1,
                        brand = $2,
                        engine = $3,
                        infotaintment_systems = $4,
                        interior_design = $5,
                        location_lat = $6,
                        location_long = $7
                          WHERE id = ${req.params.id}`,
                    [ car.title,
                      car.brand,
                      car.engine,
                      car.infotaintment_systems,
                      car.interior_design,
                      car.location_lat,
                      car.location_long
                    ])
  .then(result => {
    res.send('updated cars: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.put('/:id/location', function(req, res, next) {
  let location = req.body;
  // TODO: Check location params for null and undefined
  db.result(`UPDATE cars SET
                        location_lat = $1,
                        location_long = $2
                          WHERE id = ${req.params.id}`,
                    [ location.location_lat,
                      location.location_long
                    ])
  .then(result => {
    res.send('updated cars: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.delete('/:id', function(req, res, next) {
  // TODO: Check if car is already booked
  db.result(`DELETE FROM cars WHERE id = ${req.params.id}`)
  .then(result => {
    res.send('removed cars: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

module.exports = router;
