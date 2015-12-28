# feathers-tcomb

validate [`feathers`](http://feathersjs.com) services using [`tcomb`](https://www.npmjs.com/package/tcomb)

## install

with [`npm`](https://www.npmjs.com), run

```shell
npm install --save feathers-tcomb
```

## usage

In order for this module to work, you must `configure` [hooks](https://www.npmjs.com/package/feathers-hooks) on your feathers app.

```js
var feathers = require('feathers')
var hooks = require('feathers-hooks')
var bodyParser = require('body-parser')
var memory = require('feathers-memory')
var validate = require('feathers-tcomb')
var t = require('tcomb')

var app = feathers()
  .configure(feathers.rest())
  .configure(hooks())
  .use(bodyParser.urlencoded({ extended: true }))
  .use('things', memory())

var Thing = t.struct({
  id: t.Number,
  name: t.String
})

validate(app.service('things'), Thing)
```

## api

### `validate(service, type, [options])`

Given a [`feathers`](http://feathersjs.com) `service`, a [`tcomb`](https://www.npmjs.com/package/tcomb) `type` and [optional `options` for `tcomb-validation`](https://github.com/gcanti/tcomb-validation#basic-usage), will add a `before` [hook](https://www.npmjs.com/package/feathers-hooks) to `create`, `update`, and `patch` methods to validate the incoming data based on the type definition.

On an error, returns a [`feathers-errors` `BadRequest`](https://www.npmjs.com/package/feathers-errors).
