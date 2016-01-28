"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var co = require('co'),
    SimpleReporter = require('./reporters/simple'),
    EventEmitter = require('events');

// Event handlers
var setupEventHandler = function setupEventHandler(self) {
  return function (benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for (var i = 0; i < reporters.length; i++) {
      if (reporters[i].benchmarkSetup) reporters[i].benchmarkSetup(self, benchmark);
    }

    // Emit on suite
    self.emit('benchmark_setup', self, benchmark);
  };
};

var teardownEventHandler = function teardownEventHandler(self) {
  return function (benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for (var i = 0; i < reporters.length; i++) {
      if (reporters[i].benchmarkTeardown) reporters[i].benchmarkTeardown(self, benchmark);
    }
  };

  // Emit on suite
  self.emit('benchmark_teardown', self, benchmark);
};

var cycleEventHandler = function cycleEventHandler(self) {
  return function (cycle, benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for (var i = 0; i < reporters.length; i++) {
      if (reporters[i].benchmarkCycle) reporters[i].benchmarkCycle(cycle, self, benchmark);
    }
  };

  // Emit on suite
  self.emit('benchmark_cycle', cycle, self, benchmark);
};

var iterationEventHandler = function iterationEventHandler(self) {
  return function (iteration, cycle, benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for (var i = 0; i < reporters.length; i++) {
      if (reporters[i].benchmarkIteration) reporters[i].benchmarkIteration(iteration, cycle, self, benchmark);
    }
  };

  // Emit on suite
  self.emit('benchmark_cycle', iteration, cycle, self, benchmark);
};

// Benchmark Suite

var Suite = (function (_EventEmitter) {
  _inherits(Suite, _EventEmitter);

  function Suite(title, options) {
    _classCallCheck(this, Suite);

    // Save the title

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Suite).call(this));

    _this.title = title;

    // Unpack the options
    _this.options = options || {};

    // Save the context
    _this.context = _this.options.context ? _this.options.context : {};

    // The benchmarks
    _this.benchmarks = [];

    // Settings for suite
    _this.fn_start_setup = [];
    _this.fn_end_teardown = [];

    // Settings for benchmark
    _this.fn_benchmark_setup = [];
    _this.fn_benchmark_teardown = [];

    // Number of times we ran the suite
    _this.numberOfRuns = 0;

    // The reporters
    _this.reporters = [];
    return _this;
  }

  _createClass(Suite, [{
    key: 'addReporter',
    value: function addReporter(report) {
      this.reporters.push(report);
      return this;
    }
  }, {
    key: 'addTest',
    value: function addTest(benchmark) {
      // Push the benchmark to the list of benchmarks
      this.benchmarks.push(benchmark);

      // Set up the benchmark event listeners
      benchmark.on('setup', setupEventHandler(this));
      benchmark.on('teardown', teardownEventHandler(this));
      benchmark.on('cycle', cycleEventHandler(this));
      benchmark.on('iteration', iterationEventHandler(this));

      // Return the suite to be able to perform chaining
      return this;
    }
  }, {
    key: 'setup',
    value: function setup(fn) {
      var self = this;

      this.fn_start_setup = new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  fn(self.context, function (err) {
                    if (err) return reject(err);
                    resolve();
                  });

                case 1:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        })).catch(reject);
      });

      return self;
    }
  }, {
    key: 'teardown',
    value: function teardown(fn) {
      var self = this;

      this.fn_end_teardown = new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  fn(self.context, function (err) {
                    if (err) return reject(err);
                    resolve();
                  });

                case 1:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        })).catch(reject);
      });

      return self;
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var self = _this2;

        // Ensure no empty items
        self.context = self.context || {};

        // Set up the reporters
        var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

        co(regeneratorRuntime.mark(function _callee3() {
          var i, context;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(self.fn_start_setup.length > 0)) {
                    _context3.next = 8;
                    break;
                  }

                  i = 0;

                case 2:
                  if (!(i < self.fn_start_setup.length)) {
                    _context3.next = 8;
                    break;
                  }

                  _context3.next = 5;
                  return self.fn_start_setup[i]();

                case 5:
                  i++;
                  _context3.next = 2;
                  break;

                case 8:

                  // Emit setup
                  self.emit('setup', self);
                  for (i = 0; i < reporters.length; i++) {
                    if (reporters[i].suiteSetup) reporters[i].suiteSetup(self);
                  }

                  // Do we have any global
                  if (self.numberOfRuns == 0) {
                    self.benchmarks.forEach(function (x) {
                      // Add global setup methods
                      for (var i = 0; i < self.fn_benchmark_setup.length; i++) {
                        x.setup(self.fn_benchmark_setup[i]);
                      }

                      // Add global teardown methods
                      for (var i = 0; i < self.fn_benchmark_teardown.length; i++) {
                        x.teardown(self.fn_benchmark_teardown[i]);
                      }
                    });
                  }

                  // Execute each of the benchmarks
                  i = 0;

                case 12:
                  if (!(i < self.benchmarks.length)) {
                    _context3.next = 20;
                    break;
                  }

                  context = Object.assign({}, self.context);
                  // Reset benchmark

                  self.benchmarks[i].reset();
                  // Execute benchmark
                  _context3.next = 17;
                  return self.benchmarks[i].execute(context, self.options);

                case 17:
                  i++;
                  _context3.next = 12;
                  break;

                case 20:
                  if (!(self.fn_end_teardown.length > 0)) {
                    _context3.next = 28;
                    break;
                  }

                  i = 0;

                case 22:
                  if (!(i < self.fn_end_teardown.length)) {
                    _context3.next = 28;
                    break;
                  }

                  _context3.next = 25;
                  return self.fn_end_teardown[i]();

                case 25:
                  i++;
                  _context3.next = 22;
                  break;

                case 28:

                  // Emit setup
                  self.emit('teardown', self);

                  // Tear down any reporters
                  for (i = 0; i < reporters.length; i++) {
                    if (reporters[i].suiteTeardown) reporters[i].suiteTeardown(self);
                  }

                  // Add up the numberOfRuns performed
                  self.numberOfRuns = self.numberOfRuns + 1;

                  // Finish up
                  resolve();

                case 32:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        })).catch(reject);
      });
    }
  }, {
    key: 'benchmark',
    get: function get() {
      var self = this;

      return {
        setup: function setup(fn) {
          self.fn_benchmark_setup.push(fn);
          return self;
        },
        teardown: function teardown(fn) {
          self.fn_benchmark_teardown.push(fn);
          return self;
        }
      };
    }
  }]);

  return Suite;
})(EventEmitter);

module.exports = Suite;
