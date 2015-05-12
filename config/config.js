var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'backend'
    },
    port: 3000,
    db: 'postgres://postgres:postgres@localhost/nomad',
    SENDGRID_USERNAME: 'app35066171@heroku.com',
    SENDGRID_PASSWORD: 'kyywegri1724'
  },

  test: {
    root: rootPath,
    app: {
      name: 'backend'
    },
    port: 3000,
    db: 'postgres://localhost/nomad-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'backend'
    },
    port: process.env.PORT || 3000,
    db: process.env.DATABASE_URL
  }
};

module.exports = config[env];
