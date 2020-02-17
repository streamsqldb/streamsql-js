const express = require('express')
const https = require('https')
const fs = require('fs')
const config = require('./config')

const { port, httpsPort } = config

const urlHttp = `http://localhost:${port}`
const urlHttps = `https://wildcard.localhost.com:${httpsPort}`

const app = express()
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', urlHttp)
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-StreamSQL-Key, Content-Type, Accept'
  )
  next()
})
app.use(express.json()) // body parser
app.use(express.static(__dirname)) // serve all files from ./
app.get('/favicon.ico', function(req, res) {
  res.sendStatus(200)
})
app.post(config.apiEndpoint, function(req, res) {
  if (!req.header('x-streamsql-key')) {
    res.sendStatus(403)
  } else {
    res.status(200).send(req.body) // echo the request data
  }
})
app.post(config.apiEndpointBatch, function(req, res) {
  if (!req.header('x-streamsql-key')) {
    res.sendStatus(403)
  } else {
    res.status(200).send(req.body) // echo the request data
  }
})
app.listen(port)
console.log(`Listening on ${urlHttp}`)

if (!!process.env.USE_SSL) {
  const options = {
    key: fs.readFileSync(`${__dirname}/wildcard.localhost.com/key.pem`),
    cert: fs.readFileSync(`${__dirname}/wildcard.localhost.com/cert.pem`),
  }
  https.createServer(options, app).listen(httpsPort)
  console.log(`Listening with https at ${urlHttps}`)
}
