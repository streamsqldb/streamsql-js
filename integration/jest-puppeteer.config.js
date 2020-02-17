const { httpsPort } = require('./fixtures/config')

module.exports = {
  server: {
    command: 'npm run serve:test:ssl',
    port: httpsPort,
    launchTimeout: 10000,
  },
  launch: {
    dumpio: true,
    headless: true,
  },
}
