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
    db: 'postgres://postgres:postgres@localhost/nomad'
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
    port: 3000,
    db: 'postgres://localhost/nomad'
  }
};

module.exports = config[env];