# kuromoji-zeit
Zeit server that serves [kuromoji](https://github.com/takuyaa/kuromoji.js) data.

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

Simply send a request like `/?input=黒文字` and it will return JSON data with the kuromoji information.

## Example

The latest version of kuromoji-zeit is published online at https://kuromoji-zeit.now.sh

Try this in your browser:
 https://kuromoji-zeit.now.sh/?input=%E9%BB%92%E6%96%87%E5%AD%97

## License
MIT
