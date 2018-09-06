const express = require('express');
const createError = require('http-errors');
const router = express.Router();

const db = require('./../server/db');

router.get('/', function(req, res, next) {
  db.any('SELECT * FROM users')
  .then((users) => {
    res.send(users);
  })
  .catch((error) => {
    next(createError(error));
  });
});

router.get('/:id', function(req, res, next) {
  db.one(`SELECT * FROM users WHERE id = ${req.params.id}`)
  .then((user) => {
    res.send(user);
  })
  .catch((error) => {
    next(createError(error));
  });
});

router.post('/', function(req, res, next) {
  const user = req.body; 
  db.one(`INSERT INTO
          users(name, gender, age)
          VALUES($1,$2,$3) RETURNING id`,
          [user.name, user.gender, user.age])
  .then(newUser => {
    res.send(newUser.id);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.put('/:id', function(req, res, next) {
  const user = req.body;
  db.result(`UPDATE users SET
              name=$1,
              gender=$2,
              age=$3
              WHERE id = ${req.params.id}`,
              [
                user.name,
                user.gender,
                user.age
              ])
  .then(result => {
    res.send('updated users: '+result.rowCount);
  })
  .catch(error => {
    next(createError(error));
  });
});

router.delete('/:id', function(req, res, next) {
  // Check if any user has demands
  db.one(`SELECT * FROM demands WHERE users = ${req.params.id}`)
  .then((demand) => {
    next(createError("can't delete this user, user related demands found"));
  })
  .catch((error) => {// no demands found with such user
    console.log(error);
    if(error.message === 'No data returned from the query.'){
      db.result(`DELETE FROM users WHERE id = ${req.params.id}`)
      .then(result => {
        res.send('removed users: '+result.rowCount);
      })
      .catch(error2 => {// user not removed
        next(createError(error2));
      });
    } else {
      next(createError(error));
    }
  });
  
});

module.exports = router;
