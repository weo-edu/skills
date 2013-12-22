module.exports = {
  shared: true,
  dev: false,
  prod: false,
  development: {
    apiServer: 'http://localhost:1337',
    dev: true
  },
  production: {
    prod: true
  }
};