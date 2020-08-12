'use strict'

const kuromoji = require('kuromoji')
const path = require('path')
const dicPath = path.resolve(require.resolve('kuromoji'), '../../dict')
const hepburn = require('hepburn')

const tokenizerP = new Promise((resolve, reject) => {
  kuromoji
    .builder({dicPath})
    .build((error, tokenizer) => {
      if (error) {
        return reject(err)
      }
      resolve(tokenizer)
    })
})

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(400).send('Only GET allowed')
  }
  if (req.query.input === '') {
    return res.json([])
  }
  tokenizerP
    .then(
      tokenizer => {
        const result = tokenizer.tokenize(req.query.input)
        if (result) {
          for (const entry of result) {
            if (entry.reading) {
              entry.hepburnReading = hepburn.fromKana(entry.reading)
              entry.romanjiReading = hepburn.cleanRomaji(entry.hepburnReading)
            }
            if (entry.pronunciation) {
              entry.hepburnPronunciation = hepburn.fromKana(entry.pronunciation)
              entry.romanjiPronunciation = hepburn.cleanRomaji(entry.hepburnPronunciation)
            }
          }
        }
        res.setHeader('Cache-Control', 'public, maxage=604800, immutable')
        res.json(result)
      },
    )
    .catch(error => {
      res.status(500).send(error.stack)
    })
}
