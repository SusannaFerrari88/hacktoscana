// Polyfill Promise if none exists
if(!global.Promise) {
  require('es6-promise').polyfill();
}

// Check if we support es6 generators
try {
  eval("(function *(){})");

  // Expose all the managers
  var Benchmark = require('./lib/benchmark');
  var Suite = require('./lib/suite');
  var Stats = require('./lib/stats');
  var SimpleReporter = require('./lib/reporters/simple');
} catch(err) {
  // console.log(err.stack)
  // Load the ES6 polyfills
  require("babel-polyfill");

  // Load ES5 versions of our managers
  var Benchmark = require('./es5/benchmark');
  var Suite = require('./es5/suite');
  var Stats = require('./es5/stats');
  var SimpleReporter = require('./es5/reporters/simple');
}

// Export all the modules
module.exports = {
  Benchmark: Benchmark,
  Suite: Suite,
  Stats: Stats,
  SimpleReporter: SimpleReporter
}
