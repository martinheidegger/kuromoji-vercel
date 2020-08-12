# kuromoji-vercel

Vercel API Server that serves [kuromoji](https://github.com/takuyaa/kuromoji.js) data.

## Starting

This is a simple Nodejs Project:

```
$ npm install
added 7 packages in 1.582s

$ npm start
Tokenizer built!
Listening for requests.
```

## Usage

Simply send a request like `/api/?input=黒文字` and it will return JSON data with the kuromoji information.

## Live

You can test this app live on https://kuromoji-vercel.vercel.app/

## License
[MIT](./LICENSE)
