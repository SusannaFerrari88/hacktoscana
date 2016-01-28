"use strict"

var co = require('co'),
  SimpleReporter = require('./reporters/simple'),
  EventEmitter = require('events');

// Event handlers
var setupEventHandler = function(self) {
  return function(benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for(var i = 0; i < reporters.length; i++) {
      if(reporters[i].benchmarkSetup) reporters[i].benchmarkSetup(self, benchmark);
    }

    // Emit on suite
    self.emit('benchmark_setup', self, benchmark);
  }
}

var teardownEventHandler = function(self) {
  return function(benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for(var i = 0; i < reporters.length; i++) {
      if(reporters[i].benchmarkTeardown) reporters[i].benchmarkTeardown(self, benchmark);
    }
  }

  // Emit on suite
  self.emit('benchmark_teardown', self, benchmark);
}

var cycleEventHandler = function(self) {
  return function(cycle, benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for(var i = 0; i < reporters.length; i++) {
      if(reporters[i].benchmarkCycle) reporters[i].benchmarkCycle(cycle, self, benchmark);
    }
  }

  // Emit on suite
  self.emit('benchmark_cycle', cycle, self, benchmark);
}

var iterationEventHandler = function(self) {
  return function(iteration, cycle, benchmark) {
    var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

    for(var i = 0; i < reporters.length; i++) {
      if(reporters[i].benchmarkIteration) reporters[i].benchmarkIteration(iteration, cycle, self, benchmark);
    }
  }

  // Emit on suite
  self.emit('benchmark_cycle', iteration, cycle, self, benchmark);
}

// Benchmark Suite
class Suite extends EventEmitter {
  constructor(title, options) {
    super();

    // Save the title
    this.title = title;

    // Unpack the options
    this.options = options || {};

    // Save the context
    this.context = this.options.context ? this.options.context : {};

    // The benchmarks
    this.benchmarks = [];

    // Settings for suite
    this.fn_start_setup = [];
    this.fn_end_teardown = [];

    // Settings for benchmark
    this.fn_benchmark_setup = [];
    this.fn_benchmark_teardown = [];

    // Number of times we ran the suite
    this.numberOfRuns = 0;

    // The reporters
    this.reporters = [];
  }

  addReporter(report) {
    this.reporters.push(report);
    return this;
  }

  addTest(benchmark) {
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

  get benchmark() {
    var self = this;

    return {
      setup(fn) {
        self.fn_benchmark_setup.push(fn);
        return self;
      },

      teardown(fn) {
        self.fn_benchmark_teardown.push(fn);
        return self;
      }
    }
  }

  setup(fn) {
    var self = this;

    this.fn_start_setup = new Promise((resolve, reject) => {
      co(function*() {
        fn(self.context, function(err) {
          if(err) return reject(err);
          resolve();
        });
      }).catch(reject);
    });

    return self;
  }

  teardown(fn) {
    var self = this;

    this.fn_end_teardown = new Promise((resolve, reject) => {
      co(function*() {
        fn(self.context, function(err) {
          if(err) return reject(err);
          resolve();
        });
      }).catch(reject);
    });

    return self;
  }

  execute(context) {
    return new Promise((resolve, reject) => {
      var self = this;

      // Ensure no empty items
      self.context = self.context || {};

      // Set up the reporters
      var reporters = self.reporters.length > 0 ? self.reporters : [new SimpleReporter()];

      co(function*() {
        // Perform any setup needed
        if(self.fn_start_setup.length > 0) {
          for(var i = 0; i < self.fn_start_setup.length; i++) {
            yield self.fn_start_setup[i]();
          }
        }

        // Emit setup
        self.emit('setup', self);
        for(var i = 0; i < reporters.length; i++) {
          if(reporters[i].suiteSetup) reporters[i].suiteSetup(self);
        }

        // Do we have any global
        if(self.numberOfRuns == 0) {
          self.benchmarks.forEach(function(x) {
            // Add global setup methods
            for(var i = 0; i < self.fn_benchmark_setup.length; i++) {
              x.setup(self.fn_benchmark_setup[i]);
            }

            // Add global teardown methods
            for(var i = 0; i < self.fn_benchmark_teardown.length; i++) {
              x.teardown(self.fn_benchmark_teardown[i]);
            }
          });
        }

        // Execute each of the benchmarks
        for(var i = 0; i < self.benchmarks.length; i++) {
          var context = Object.assign({}, self.context);
          // Reset benchmark
          self.benchmarks[i].reset();
          // Execute benchmark
          yield self.benchmarks[i].execute(context, self.options);
        }

        // Perform any setup needed
        if(self.fn_end_teardown.length > 0) {
          for(var i = 0; i < self.fn_end_teardown.length; i++) {
            yield self.fn_end_teardown[i]();
          }
        }

        // Emit setup
        self.emit('teardown', self);

        // Tear down any reporters
        for(var i = 0; i < reporters.length; i++) {
          if(reporters[i].suiteTeardown) reporters[i].suiteTeardown(self);
        }

        // Add up the numberOfRuns performed
        self.numberOfRuns = self.numberOfRuns + 1;

        // Finish up
        resolve();
      }).catch(reject);
    });
  }
}

module.exports = Suite;
