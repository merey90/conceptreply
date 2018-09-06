const express = require('express');
const createError = require('http-errors');
const router = express.Router();

const db = require('./../server/db');

/**
 * Get all schedules
 */
router.get('/', function(req, res, next) {
  db.any('SELECT * FROM schedules')
  .then((schedules) => {
    res.send(schedules);
  })
  .catch((error) => {
    next(createError(error));
  });
});

router.get('/:id', function(req, res, next) {
  db.one(`SELECT * FROM schedules WHERE id = ${req.params.id}`)
  .then((schedule) => {
    res.send(schedule);
  })
  .catch((error) => {
    next(createError(error));
  });
});

router.post('/', function(req, res, next) {
  const schedule = req.body; 
  db.one(`INSERT INTO
          schedules(car, demand)
          VALUES($1,$2) RETURNING id`,
          [schedule.car, schedule.demand])
  .then(newschedule => {
    // TODO: update related car & demand statuses in db
    res.send(newschedule.id);
  })
  .catch(error => {
    next(createError(error));
  });
});

/**
 * Create schedule for exact demand(TASK 3)
 */
router.post('/demands/:id', function(req, res, next) {
  db.one(`SELECT * FROM demands WHERE id=${req.params.id}`)
  .then(demand=> {
    // Select all available cars on desired time
    db.any(`SELECT * FROM cars c
                    WHERE c.engine=$1
                      AND c.interior_design=$2
                      AND ANY(c.infotaintment_systems) = $3
                      AND c.available=true
                      AND NOT exists(SELECT d.*
                                      FROM SCHEDULES s
                                      LEFT JOIN DEMANDS as d
                                            ON s.demand = d.id 
                                            WHERE s.car = c.id
                                            AND d.id != $4
                                            AND ($5 BETWEEN d.pick_time AND d.drop_time
                                            OR $6 BETWEEN d.pick_time AND d.drop_time
                                            OR d.pick_time BETWEEN $5 AND $6
                                            OR d.drop_time BETWEEN $5 AND $6))`,
      [
        demand.engine,
        demand.interior_design,
        demand.infotaintment_systems,
        demand.id,
        demand.pick_time,
        demand.drop_time
      ])
      .then(cars => {
        //find nearest car at desired time
        /**
         * Ideally we need to locate car at desired time,
         * not relying on location that is written on cars table in DB
         */
        let resultCar;
        let shortDistance =-1;
        cars.map(car => {
          if(shortDistance === -1 ||
            Math.abs(car.location_lat - demand.pick_lat) +
            Math.abs(car.location_long - demand.pick_long) < shortDistance){
              shortDistance = Math.abs(car.location_lat - demand.pick_lat) + Math.abs(car.location_long - demand.pick_long);
              resultCar = car;
          }
        });
        // Save schedule
        db.one(`INSERT INTO
          schedules(car, demand)
          VALUES($1,$2) RETURNING id`,
          [resultCar.id, req.params.id])
        .then(newschedule => {
          // TODO: update related car & demand statuses in db
          res.send(newschedule.id);
        })
        .catch(error => { // can't save schedule
          next(createError(error));
        });
      })
      .catche(error => { // Cant find such cars
        if(error.message === 'No data returned from the query.'){
          next(createError('No cars available for this demand'));
        }else {
          next(createError(error));
        }
      });
  })
  .catche(error => { // can't find demand
    next(createError(error));
  });
  
});

/**
 * Update schedule.
 */
router.put('/:id', function(req, res, next) {
  const schedule = req.body;
  // TODO: update previous related car & demand statuses in db
  // TODO: check if car & demand are exist in db
  db.result(`UPDATE schedules
                SET car=$1,
                    demand=$2
              WHERE id = ${req.params.id}`,
              [
                schedule.car,
                schedule.demand
              ])
  .then(result => {
    // TODO: update new related car & demand statuses in db
    res.send('updated schedules: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.put('/:id/complete', function(req, res, next) {
  db.result(`UPDATE schedules
                SET completed=true
              WHERE id = ${req.params.id}`)
  .then(result => {
    res.send('updated schedules: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.delete('/:id', function(req, res, next) {
  // get schedule details
  db.one(`SELECT * FROM schedules WHERE id = ${req.params.id}`)
  .then(schedule => {
    // Update car aviability
    db.result(`UPDATE cars SET available=true WHERE id=${schedule.car}`)
    .then(result => {
      if(result.rowCount > 0){
        // Update demand served
        db.result(`UPDATE demands SET is_arch=false WHERE id=${schedule.demand}`)
        .then(result2 => {
          if(result2.rowCount > 0){
            // Now we can remove shedule
            db.result(`DELETE FROM schedules WHERE id = ${req.params.id}`)
            .then(result => {
              res.send('removed schedules: '+result.rowCount);
            })
            .catch(error => {// schedule not removed
              // TODO: return related car and demand status back.
              next(createError(error));
            });
          }else{
            // TODO: Handle no such demand
            next(createError('no such demand'));
          }
        })
        .catch(error => {
          next(createError(error));
        });
      } else {
        // TODO: Handle no such car
        next(createError('no such car'));
      }
    })
    .catch(error => {
      next(createError(error));
    });
  })
  .catch(error => {// no such schedule
    next(createError(error));
  });
});

module.exports = router;