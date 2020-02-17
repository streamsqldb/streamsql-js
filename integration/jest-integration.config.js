module.exports = {
  displayName: 'integration',
  testRegex: 'test.(js)$',
  preset: 'jest-puppeteer',
  globals: {
    SERVER_URL: !!process.env.USE_SSL
      ? 'https://wildcard.localhost.com:9001'
      : 'http://localhost:9000',
  },
  testPathIgnorePatterns: ['/node_modules/', '/src/'],
}
