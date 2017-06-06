'use strict'

const kuromoji = require('kuromoji')
const path = require('path')
const dicPath = path.resolve(require.resolve('kuromoji'), '../../dict')
const http = require('http')
const url = require('url')
const qs = require('querystring')
const hepburn = require('hepburn')

function jsonResponse (res, statusCode, message) {
  if (!message) {
    message = {}
  }
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  }
  if (statusCode !== 200) {
    message.error = http.STATUS_CODES[statusCode]
  } else {
    headers['Cache-Control'] = 'public, max-age=31536000'
  }
  res.writeHead(statusCode, headers)
  res.end(JSON.stringify(message))
}

function badRequest (res, reason) {
  jsonResponse(res, 400, {reason})
}

function notFound (res) {
  jsonResponse(res, 404)
}

kuromoji
  .builder({dicPath})
  .build((err, tokenizer) => {
    if (err) {
      console.error(err.stack || err)
      process.exit(1)
    }
    console.log('Tokenizer built!')
    http.createServer((req, res) => {
      if (req.method !== 'GET') {
        return badReqest(res, 'Only GET allowed')
      }
      const parts = url.parse(req.url)
      if (parts.pathname !== '/') {
        return notFound(res)
      }
      if (!parts.query) {
        return badRequest(res, 'Query string required')
      }
      const query = qs.parse(parts.query)
      if (Object.keys(query).length > 1 || query.input === undefined) {
        return badRequest(res, `Only 'input' query string allowed`)
      }
      if (Array.isArray(query.input)) {
        return badRequest(res, 'Only one input parameter allowed')
      }
      const result = tokenizer.tokenize(query.input)
      if (result) {
        result.forEach((entry) => {
          if (entry.reading) {
            entry.hepburnReading = hepburn.fromKana(entry.reading)
            entry.romanjiReading = hepburn.cleanRomaji(entry.hepburnReading)
          }
          if (entry.pronunciation) {
            entry.hepburnPronunciation = hepburn.fromKana(entry.pronunciation)
            entry.romanjiPronunciation = hepburn.cleanRomaji(entry.hepburnPronunciation)
          }
        })
      }
      jsonResponse(res, 200, result)
    }).listen(3000, () => {
      console.log('Listening for requests.')
    })
  })
