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
        return reject(error)
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
          const hepburnReading = hepburn.fromKana(entry.reading)
          entry.readingHiragana = hepburn.toHiragana(hepburnReading)
          entry.hepburnReading = hepburnReading
          entry.romanjiReading = hepburn.cleanRomaji(hepburnReading)
        }
        if (entry.pronunciation) {
          const hepburnPronunciation = hepburn.fromKana(entry.pronunciation)
          entry.pronunciationHiragana = hepburn.toHiragana(hepburnPronunciation)
          entry.hepburnPronunciation = hepburnPronunciation
          entry.romanjiPronunciation = hepburn.cleanRomaji(hepburnPronunciation)
        }
      }
    }
    res.setHeader('Cache-Control', 'public, maxage=604800, immutable')
    res.json(result)
  } catch (error) {
    res.status(500).send(error.stack)
  }
}
