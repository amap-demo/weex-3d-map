module.exports = function (debug) {
  return {
    log: function () {
      return debug && console.log.apply(console, arguments)
    }
  }
}
