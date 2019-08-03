const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xss = require('xss');
const config = require('../config');

const AuthServices = {
  getById(db, id) {
    return db('users')
      .select('*')
      .where('users.id', id)
      .first();
  },
  //
  // Registration
  hasUserWithUsername(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  insertUser(db, user) {
    return db
      .insert(user)
      .into('users')
      .returning('*')
      .then(([ user ]) => user)
      .then(user => {
        return AuthServices.getById(db, user.id);
      });
  },
  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
    };
  },
  //
  // Login
  getUserWithUsername(db, username) {
    return db('users')
      .where({ username })
      .first();
  },
  comparePasswords(loginPassword, hash) {
    return bcrypt.compare(loginPassword, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256',
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  },
  parseBasicToken(token) {
    return Buffer.from(token, 'base64')
      .toString()
      .split(':');
  },
};

module.exports = AuthServices;