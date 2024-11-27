'use strict'

import kuromoji from 'kuromoji'
import * as hepburn from 'hepburn'
import { fileURLToPath } from 'node:url'

const dicPath = fileURLToPath(new URL('../dict', import.meta.resolve('kuromoji')))
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

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Only GET allowed')
  }
  if (!req.query.input) {
    return res.status(400).send('Input query parameter required')
  }
  if (req.query.input === '') {
    return res.json([])
  }
  try {
    const tokenizer = await tokenizerP
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
  } catch (error) {
    res.status(500).send(error.stack)
  }
}
