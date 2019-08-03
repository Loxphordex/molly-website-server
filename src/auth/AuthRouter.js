const express = require('express');
const AuthRouter = express.Router();
const bodyParser = express.json();
const AuthServices = require('./AuthServices');
const path = require('path');

AuthRouter
  .route('/register')
  .get((req, res) => {
    return res.status(200).json({ message: 'Connected to /register' });
  });

AuthRouter
  .route('/register')
  .post(bodyParser, (req, res, next) => {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Missing username in request body' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password in request body' });
    }

    AuthServices.hasUserWithUsername(req.app.get('db'), username)
      .then(userExists => {
        if (userExists) {
          return res.status(400).json({ error: 'Username already exists' });
        }

        return AuthServices.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              username,
              password: hashedPassword,
            };

            AuthServices.insertUser(req.app.get('db'), newUser)
              .then(user => {
                res.status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json({ user: AuthServices.serializeUser(user) });
              });
          });
      })
      .catch(next);
  });

AuthRouter
  .route('/login')
  .post(bodyParser, (req, res, next) => {
    const { username, password } = req.body;
    const userCreds = { username, password };

    for (const [key, value] of Object.entries(userCreds)) {
      if (!value) {
        return res.status(400).json(
          { error: `Missing ${key} in request body` }
        );
      }
    }

    AuthServices.getUserWithUsername(req.app.get('db'), userCreds.username)
      .then(dbUser => {
        if (!dbUser) {
          return res.status(400).json({ error: 'Incorrect username or password' });
        }
        return AuthServices.comparePasswords(userCreds.password, dbUser.password)
          .then(match => {
            if (!match) {
              return res.status(400).json({ error: 'Incorrect username or password' });
            }

            const subject = dbUser.username;
            const payload = { user_id: dbUser.id };

            res.send({
              authToken: AuthServices.createJwt(subject, payload)
            });
          })
          .catch(err => {
            console.error(err);
            next();
          });
      });
  });

module.exports = AuthRouter;