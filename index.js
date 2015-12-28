var errors = require('feathers-errors').default
var t = require('tcomb-validation')
var assign = require('object-assign')

module.exports = validate

// assumes service is already configured with 'feathers-hooks'
function validate (service, type, options) {
  var validateHook = createValidateHook(type, options)

  service.before({
    create: validateHook,
    update: validateHook,
    patch: function (hook, next) {
      // we want to validate the full object
      // so first get the current object
      // then apply the patch in memory
      // finally validate this full patched object
      service.get(hook.id, function (err, data) {
        if (err) { return next(err) }
        var vhookObject = assign({}, hook, {
          data: assign(data, hook.data)
        })
        validateHook(vhookObject, next)
      })
    }
  })
}

function createValidateHook (type, options) {
  return function validateHook (hook, next) {
    var result = t.validate(hook.data, type, options)

    if (!result.isValid()) {
      var err = new Error('feathers-tcomb: Validation Error')
      err.errors = result.errors
      next(new errors.BadRequest(err, result.value))
    } else {
      next()
    }
  }
}
