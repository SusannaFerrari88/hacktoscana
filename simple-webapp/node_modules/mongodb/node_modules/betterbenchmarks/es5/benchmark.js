"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var co = require('co'),
    Stats = require('./stats'),
    EventEmitter = require('events');

// Test

var Benchmark = (function (_EventEmitter) {
  _inherits(Benchmark, _EventEmitter);

  function Benchmark(title, options) {
    _classCallCheck(this, Benchmark);

    // Benchmark title

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Benchmark).call(this));

    _this.title = title;

    // All the functions
    _this.fn = null;
    _this.fn_custom = null;
    _this.fn_cycle_setup = [];
    _this.fn_cycle_teardown = [];
    _this.fn_iteration_setup = [];
    _this.fn_iteration_teardown = [];
    _this.fn_start_setup = [];
    _this.fn_end_teardown = [];

    // Unpack the options
    _this.options = options || {};

    // We have a specific context
    _this.context = {};

    // Statistics
    _this.stats = [];
    _this.currentStats = null;
    return _this;
  }

  _createClass(Benchmark, [{
    key: 'reset',
    value: function reset() {
      // Reset the options for the benchmark
      this.context = Object.assign({}, this.originalContext);
      this.stats = [];
      this.currentStats = null;
    }
  }, {
    key: 'custom',
    value: function custom(fn) {
      this.fn_custom = function (context, stats, options) {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    fn(context, stats, options, function (err) {
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
      };

      return this;
    }
  }, {
    key: 'set',
    value: function set(fn) {
      var self = this;

      self.fn = function (isAsync) {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!isAsync) {
                      _context2.next = 2;
                      break;
                    }

                    return _context2.abrupt('return', fn(self.context, function (err) {
                      if (err) return reject(err);
                      resolve();
                    }));

                  case 2:

                    // Are we running a sync operation
                    fn(self.context);
                    resolve();

                  case 4:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          })).catch(reject);
        });
      };

      return this;
    }
  }, {
    key: 'cycle',
    value: function cycle() {
      var self = this;

      return {
        setup: function setup(fn) {
          self.fn_cycle_setup.push(function () {
            return new Promise(function (resolve, reject) {
              co(regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        fn(self.context, self.options, function (err) {
                          if (err) return reject(err);
                          resolve();
                        });

                      case 1:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, this);
              })).catch(reject);
            });
          });

          return self;
        },
        teardown: function teardown(fn) {
          self.fn_cycle_teardown.push(function () {
            return new Promise(function (resolve, reject) {
              co(regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        fn(self.context, self.options, function (err) {
                          if (err) return reject(err);
                          resolve();
                        });

                      case 1:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              })).catch(reject);
            });
          });

          return self;
        }
      };
    }
  }, {
    key: 'iteration',
    value: function iteration() {
      var self = this;

      return {
        setup: function setup(fn) {
          self.fn_iteration_setup.push(function () {
            return new Promise(function (resolve, reject) {
              co(regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        fn(self.context, self.options, function (err) {
                          if (err) return reject(err);
                          resolve();
                        });

                      case 1:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, this);
              })).catch(reject);
            });
          });

          return self;
        },
        teardown: function teardown(fn) {
          self.fn_iteration_teardown.push(function () {
            return new Promise(function (resolve, reject) {
              co(regeneratorRuntime.mark(function _callee6() {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        fn(self.context, self.options, function (err) {
                          if (err) return reject(err);
                          resolve();
                        });

                      case 1:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, this);
              })).catch(reject);
            });
          });

          return self;
        }
      };
    }
  }, {
    key: 'addMetadata',
    value: function addMetadata(metadata) {
      this.metadata = Object.assign({}, this.metadata || {}, metadata);
      return this;
    }
  }, {
    key: 'setup',
    value: function setup(fn) {
      var self = this;

      this.fn_start_setup.push(function (options) {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee7() {
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    fn(self.context, options, function (err) {
                      if (err) return reject(err);
                      resolve();
                    });

                  case 1:
                  case 'end':
                    return _context7.stop();
                }
              }
            }, _callee7, this);
          })).catch(reject);
        });
      });

      return this;
    }
  }, {
    key: 'teardown',
    value: function teardown(fn) {
      var self = this;

      this.fn_end_teardown.push(function () {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee8() {
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    fn(self.context, self.stats, self.options, function (err) {
                      if (err) return reject(err);
                      resolve();
                    });

                  case 1:
                  case 'end':
                    return _context8.stop();
                }
              }
            }, _callee8, this);
          })).catch(reject);
        });
      });

      return this;
    }
  }, {
    key: 'execute',
    value: function execute(context, options) {
      var self = this;
      // We need either the normal function or custom override function to be defined
      if (!this.fn && !this.fn_custom) throw new Error('no benchmark function set');

      // Ensure we don't have null pointers
      context = context || {};
      options = options || {};

      // Merge the options together
      var finalOptions = Object.assign({}, options, self.options);

      // Create a new context for the benchmark
      this.context = context ? Object.assign({}, context) : {};

      // Return execution promise for the benchmark
      return new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee9() {
          var i, warmup, cycles, iterations, isAsync, j, k;
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  if (!(self.fn_start_setup.length > 0)) {
                    _context9.next = 8;
                    break;
                  }

                  i = 0;

                case 2:
                  if (!(i < self.fn_start_setup.length)) {
                    _context9.next = 8;
                    break;
                  }

                  _context9.next = 5;
                  return self.fn_start_setup[i](finalOptions);

                case 5:
                  i++;
                  _context9.next = 2;
                  break;

                case 8:

                  // Unpack any options
                  warmup = finalOptions.warmup || 100;
                  cycles = finalOptions.cycles || 100;
                  iterations = finalOptions.iterations || 1000;
                  isAsync = typeof finalOptions.async == 'boolean' ? finalOptions.async : true;

                  // Emit setup

                  self.emit('setup', self);

                  //
                  // Warm up
                  //
                  // Do we need to perform some warm up iterations

                  if (!(warmup > 0 && self.fn)) {
                    _context9.next = 38;
                    break;
                  }

                  if (!(self.fn_cycle_setup.length > 0)) {
                    _context9.next = 22;
                    break;
                  }

                  i = 0;

                case 16:
                  if (!(i < self.fn_cycle_setup.length)) {
                    _context9.next = 22;
                    break;
                  }

                  _context9.next = 19;
                  return self.fn_cycle_setup[i]();

                case 19:
                  i++;
                  _context9.next = 16;
                  break;

                case 22:
                  i = 0;

                case 23:
                  if (!(i < warmup)) {
                    _context9.next = 29;
                    break;
                  }

                  _context9.next = 26;
                  return self.fn(isAsync);

                case 26:
                  i++;
                  _context9.next = 23;
                  break;

                case 29:
                  if (!(self.fn_cycle_teardown.length > 0)) {
                    _context9.next = 37;
                    break;
                  }

                  i = 0;

                case 31:
                  if (!(i < self.fn_cycle_teardown.length)) {
                    _context9.next = 37;
                    break;
                  }

                  _context9.next = 34;
                  return self.fn_cycle_teardown[i]();

                case 34:
                  i++;
                  _context9.next = 31;
                  break;

                case 37:

                  // Reset all stats
                  self.stats = [];

                case 38:
                  i = 0;

                case 39:
                  if (!(i < cycles)) {
                    _context9.next = 95;
                    break;
                  }

                  if (!(self.fn_cycle_setup.length > 0)) {
                    _context9.next = 48;
                    break;
                  }

                  j = 0;

                case 42:
                  if (!(j < self.fn_cycle_setup.length)) {
                    _context9.next = 48;
                    break;
                  }

                  _context9.next = 45;
                  return self.fn_cycle_setup[j]();

                case 45:
                  j++;
                  _context9.next = 42;
                  break;

                case 48:

                  // Current stats object
                  self.currentStats = new Stats();
                  self.currentStats.start();

                  // We have a custom execution

                  if (!self.fn_custom) {
                    _context9.next = 55;
                    break;
                  }

                  _context9.next = 53;
                  return self.fn_custom(self.context, self.currentStats, finalOptions);

                case 53:
                  _context9.next = 81;
                  break;

                case 55:
                  j = 0;

                case 56:
                  if (!(j < iterations)) {
                    _context9.next = 81;
                    break;
                  }

                  if (!(self.fn_iteration_setup.length > 0)) {
                    _context9.next = 65;
                    break;
                  }

                  k = 0;

                case 59:
                  if (!(k < self.fn_iteration_setup.length)) {
                    _context9.next = 65;
                    break;
                  }

                  _context9.next = 62;
                  return self.fn_iteration_setup[k]();

                case 62:
                  k++;
                  _context9.next = 59;
                  break;

                case 65:

                  self.currentStats.startIteration();
                  _context9.next = 68;
                  return self.fn(isAsync);

                case 68:
                  self.currentStats.endIteration();

                  // Perform the iteration teardown if we have one

                  if (!(self.fn_iteration_teardown.length > 0)) {
                    _context9.next = 77;
                    break;
                  }

                  k = 0;

                case 71:
                  if (!(k < self.fn_iteration_teardown.length)) {
                    _context9.next = 77;
                    break;
                  }

                  _context9.next = 74;
                  return self.fn_iteration_teardown[k]();

                case 74:
                  k++;
                  _context9.next = 71;
                  break;

                case 77:

                  // Finished iteration
                  self.emit('iteration', i, j, self);

                case 78:
                  j++;
                  _context9.next = 56;
                  break;

                case 81:

                  // Push the stats to the list of statistics objects for this benchmark
                  self.currentStats.end();
                  self.stats.push(self.currentStats);

                  // Perform the cycle teardown if we have one

                  if (!(self.fn_cycle_teardown.length > 0)) {
                    _context9.next = 91;
                    break;
                  }

                  j = 0;

                case 85:
                  if (!(j < self.fn_cycle_teardown.length)) {
                    _context9.next = 91;
                    break;
                  }

                  _context9.next = 88;
                  return self.fn_cycle_teardown[j]();

                case 88:
                  j++;
                  _context9.next = 85;
                  break;

                case 91:

                  // Emit the cycle
                  self.emit('cycle', i, self);

                case 92:
                  i++;
                  _context9.next = 39;
                  break;

                case 95:
                  if (!(self.fn_end_teardown.length > 0)) {
                    _context9.next = 103;
                    break;
                  }

                  i = 0;

                case 97:
                  if (!(i < self.fn_end_teardown.length)) {
                    _context9.next = 103;
                    break;
                  }

                  _context9.next = 100;
                  return self.fn_end_teardown[i]();

                case 100:
                  i++;
                  _context9.next = 97;
                  break;

                case 103:

                  // Emit execute event
                  self.emit('teardown', self);

                  // Resolve the benchmark execution
                  resolve();

                case 105:
                case 'end':
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        })).catch(reject);
      });
    }
  }]);

  return Benchmark;
})(EventEmitter);

module.exports = Benchmark;
