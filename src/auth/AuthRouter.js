const express = require('express');
const AuthRouter = express.Router();
const bodyParser = express.json();
const AuthServices = require('./AuthServices');
const path = require('path');

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

module.exports = AuthRouter;