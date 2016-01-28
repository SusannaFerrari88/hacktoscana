"use strict"

var co = require('co'),
  Stats = require('./stats'),
  EventEmitter = require('events');

// Test
class Benchmark extends EventEmitter {
  constructor(title, options) {
    super();

    // Benchmark title
    this.title = title;

    // All the functions
    this.fn = null;
    this.fn_custom = null;
    this.fn_cycle_setup = [];
    this.fn_cycle_teardown = [];
    this.fn_iteration_setup = [];
    this.fn_iteration_teardown = [];
    this.fn_start_setup = [];
    this.fn_end_teardown = [];

    // Unpack the options
    this.options = options || {};

    // We have a specific context
    this.context = {};

    // Statistics
    this.stats = [];
    this.currentStats = null;
  }

  reset() {
    // Reset the options for the benchmark
    this.context = Object.assign({}, this.originalContext);
    this.stats = [];
    this.currentStats = null;
  }

  custom(fn) {
    this.fn_custom = function(context, stats, options) {
      return new Promise((resolve, reject) => {
        co(function*() {
          fn(context, stats, options, function(err) {
            if(err) return reject(err);
            resolve();
          });
        }).catch(reject);
      });
    }

    return this;
  }

  set(fn) {
    var self = this;

    self.fn = function(isAsync) {
      return new Promise((resolve, reject) => {
        co(function*() {
          // Are we running an async operation
          if(isAsync) {
            return fn(self.context, function(err) {
              if(err) return reject(err);
              resolve();
            });
          }

          // Are we running a sync operation
          fn(self.context);
          resolve();
        }).catch(reject);
      });
    }

    return this;
  }

  cycle() {
    var self = this;

    return {
      setup(fn) {
        self.fn_cycle_setup.push(function() {
          return new Promise((resolve, reject) => {
            co(function*() {
              fn(self.context, self.options, function(err) {
                if(err) return reject(err);
                resolve();
              });
            }).catch(reject);
          });
        });

        return self;
      },

      teardown(fn) {
        self.fn_cycle_teardown.push(function() {
          return new Promise((resolve, reject) => {
            co(function*() {
              fn(self.context, self.options, function(err) {
                if(err) return reject(err);
                resolve();
              });
            }).catch(reject);
          });
        });

        return self;
      }
    }
  }

  iteration() {
    var self = this;

    return {
      setup(fn) {
        self.fn_iteration_setup.push(function() {
          return new Promise((resolve, reject) => {
            co(function*() {
              fn(self.context, self.options, function(err) {
                if(err) return reject(err);
                resolve();
              });
            }).catch(reject);
          });
        });

        return self;
      },

      teardown(fn) {
        self.fn_iteration_teardown.push(function() {
          return new Promise((resolve, reject) => {
            co(function*() {
              fn(self.context, self.options, function(err) {
                if(err) return reject(err);
                resolve();
              });
            }).catch(reject);
          });
        });

        return self;
      }
    }
  }

  addMetadata(metadata) {
    this.metadata = Object.assign({}, this.metadata || {}, metadata);
    return this;
  }

  setup(fn) {
    var self = this;

    this.fn_start_setup.push(function(options) {
      return new Promise((resolve, reject) => {
        co(function*() {
          fn(self.context, options, function(err) {
            if(err) return reject(err);
            resolve();
          });
        }).catch(reject);
      });
    });

    return this;
  }

  teardown(fn) {
    var self = this;

    this.fn_end_teardown.push(function() {
      return new Promise((resolve, reject) => {
        co(function*() {
          fn(self.context, self.stats, self.options, function(err) {
            if(err) return reject(err);
            resolve();
          });
        }).catch(reject);
      });
    });

    return this;
  }

  execute(context, options) {
    var self = this;
    // We need either the normal function or custom override function to be defined
    if(!this.fn && !this.fn_custom) throw new Error('no benchmark function set');

    // Ensure we don't have null pointers
    context = context || {};
    options = options || {};

    // Merge the options together
    var finalOptions = Object.assign({}, options, self.options);

    // Create a new context for the benchmark
    this.context = context ? Object.assign({}, context) : {};

    // Return execution promise for the benchmark
    return new Promise(function(resolve, reject) {
      co(function*() {
        // Perform any setup needed
        if(self.fn_start_setup.length > 0) {
          for(var i = 0; i < self.fn_start_setup.length; i++) {
            yield self.fn_start_setup[i](finalOptions);
          }
        }

        // Unpack any options
        var warmup = finalOptions.warmup || 100;
        var cycles = finalOptions.cycles || 100;
        var iterations = finalOptions.iterations || 1000;
        var isAsync = typeof finalOptions.async == 'boolean' ? finalOptions.async : true;

        // Emit setup
        self.emit('setup', self);

        //
        // Warm up
        //
        // Do we need to perform some warm up iterations
        if(warmup > 0 && self.fn) {
          // Perform the cycle setup if we have one
          if(self.fn_cycle_setup.length > 0) {
            for(var i = 0; i < self.fn_cycle_setup.length; i++) {
              yield self.fn_cycle_setup[i]();
            }
          }

          // For the number of cycles
          for(var i = 0; i < warmup; i++) {
            yield self.fn(isAsync);
          }

          // Perform the cycle teardown if we have one
          if(self.fn_cycle_teardown.length > 0) {
            for(var i = 0; i < self.fn_cycle_teardown.length; i++) {
              yield self.fn_cycle_teardown[i]();
            }
          }

          // Reset all stats
          self.stats = [];
        }

        //
        // Execute benchmark for x number of cycles y number of iterations
        //
        for(var i = 0; i < cycles; i++) {
          // Perform the cycle setup if we have one
          if(self.fn_cycle_setup.length > 0) {
            for(var j = 0; j < self.fn_cycle_setup.length; j++) {
              yield self.fn_cycle_setup[j]();
            }
          }

          // Current stats object
          self.currentStats = new Stats();
          self.currentStats.start();

          // We have a custom execution
          if(self.fn_custom) {
            yield self.fn_custom(self.context, self.currentStats, finalOptions);
          } else {
            // Execute all the iterations
            for(var j = 0; j < iterations; j++) {
              // Perform the iteration setup if we have one
              if(self.fn_iteration_setup.length > 0) {
                for(var k = 0; k < self.fn_iteration_setup.length; k++) {
                  yield self.fn_iteration_setup[k]();
                }
              }

              self.currentStats.startIteration();
              yield self.fn(isAsync);
              self.currentStats.endIteration();

              // Perform the iteration teardown if we have one
              if(self.fn_iteration_teardown.length > 0) {
                for(var k = 0; k < self.fn_iteration_teardown.length; k++) {
                  yield self.fn_iteration_teardown[k]();
                }
              }

              // Finished iteration
              self.emit('iteration', i, j, self);
            }
          }

          // Push the stats to the list of statistics objects for this benchmark
          self.currentStats.end();
          self.stats.push(self.currentStats);

          // Perform the cycle teardown if we have one
          if(self.fn_cycle_teardown.length > 0) {
            for(var j = 0; j < self.fn_cycle_teardown.length; j++) {
              yield self.fn_cycle_teardown[j]();
            }
          }

          // Emit the cycle
          self.emit('cycle', i, self);
        }

        // Perform any teardown needed
        if(self.fn_end_teardown.length > 0) {
          for(var i = 0; i < self.fn_end_teardown.length; i++) {
            yield self.fn_end_teardown[i]();
          }
        }

        // Emit execute event
        self.emit('teardown', self);

        // Resolve the benchmark execution
        resolve();
      }).catch(reject);
    });
  }
}

module.exports = Benchmark;
