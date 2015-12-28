var test = require('tape')
var feathers = require('feathers')
var hooks = require('feathers-hooks')
var memory = require('feathers-memory')
var each = require('async-each')
var t = require('tcomb-validation')

var validate

test('require module', function (t) {
  validate = require('./')
  t.ok(validate, 'module exports')
  t.equal(typeof validate, 'function', 'module exports function')
  t.end()
})

test('validates service', function (t) {
  var app = createThingsApp()

  var things = app.service('things')

  var ops = [
    ['create', { id: 0, name: 'computer' }, null],
    ['update', { id: 0, name: 'desk' }, null],
    ['create', { id: 'a', name: 'chair' }, true],
    ['patch', { id: 0, name: 'chair' }, null]
  ]

  each(ops, function (op, next) {
    var fn = op[0]
    var input = op[1]
    var error = op[2]

    var cb = function (err, output) {
      if (error == null) {
        t.error(err, 'no error with ' + fn + '(' + input.id + ')')
        t.equal(output.id, input.id, 'returned object has same id')
      } else {
        t.ok(err, 'has error')
        t.equal(err.message, 'feathers-tcomb: Validation Error', 'error has correct message')
        t.equal(err.name, 'BadRequest', 'error has correct name')
        t.deepEqual(err.data, input, 'error has input as data')
        t.equal(err.errors.length, 1, 'one validation error')
        t.deepEqual(err.errors[0].path, ['id'], 'validation error refers to id')
        t.equal(err.errors[0].expected.meta.name, 'Number', 'validation error expected string')
      }
      next()
    }

    switch (fn) {
      case 'create':
        things[fn](input, cb)
        break
      case 'update':
      case 'patch':
        things[fn](input.id, input, cb)
        break
      default:
        next(new Error('unimplemented'))
    }
  }, function (err) {
    t.error(err, "test doesn't error")
    t.end()
  })
})

function createThingsApp () {
  var app = feathers()
    .configure(hooks())

  app.use('things', memory())

  var Thing = t.struct({
    id: t.Number,
    name: t.String
  }, 'Thing')

  validate(app.service('things'), Thing)

  return app
}
