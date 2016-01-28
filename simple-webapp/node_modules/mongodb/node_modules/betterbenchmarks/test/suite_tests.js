"use strict"

var co = require('co'),
  f = require('util').format,
  assert = require('assert');

var Benchmark = require('../').Benchmark,
  Suite = require('../').Suite,
  SimpleReporter = require('../').SimpleReporter,
  Stats = require('../').Stats;

// Polyfill Promise if none exists
if(!global.Promise) {
  require('es6-promise').polyfill();
}

// Get babel polyfill
require("babel-polyfill");

describe('Suite', function() {
  describe('basic', function() {
    it('add a simple suite with a single benchmark', function(done) {
      co(function*() {
        // Createa new suite
        var suite = new Suite('test suite', {
          async: false, cycles: 10, iterations: 1000
        });

        // Add a new bencmark
        suite.addTest(new Benchmark('simple sync test')
          .set(function(context, option) {
            for(var i = 0; i < 1000; i++) ;
          }));

        // Execute the test suite
        yield suite.execute();

        // Done
        done();
      });
    });

    it('add a simple suite with a single benchmark and custom per benchmark setup', function(done) {
      this.timeout(200000);

      co(function*() {
        // Createa new suite
        var suite = new Suite('test suite', {
          async: false, cycles: 10, iterations: 1000
        });

        // Add a new bencmark
        suite.addTest(
          new Benchmark('simple sync test')
            .set(function(context, option) {
              for(var i = 0; i < 1000; i++) {}
            })
        );

        // Counts of executions
        var setup = 0, teardown = 0;
        var suiteSetup = 0, suiteTeardown = 0;

        //
        // Adds suite global setup methods
        //
        suite.setup(function(context, options, callback) {
          suiteSetup = suiteSetup + 1;
          callback();
        });

        // Add teardown step for all benchmarks
        suite.teardown(function(context, stats, options, callback) {
          suiteTeardown = suiteTeardown + 1;
          callback();
        });

        //
        // Adds benchmark global setup method
        //

        // Add setup step for all benchmarks
        suite.benchmark.setup(function(context, options, callback) {
          setup = setup + 1;
          callback();
        });

        // Add teardown step for all benchmarks
        suite.benchmark.teardown(function(context, stats, options, callback) {
          teardown = teardown + 1;
          callback();
        });

        // Execute the test suite
        yield suite.execute();

        // Assertions
        assert.equal(1, teardown);
        assert.equal(1, setup);
        assert.equal(1, suiteSetup);
        assert.equal(1, suiteTeardown);

        // Done
        done();
      }).catch(function(e) {
        console.log(e.stack);
      });
    });

    it('perform some simple benchmarks and report on it using the simple reporter', function(done) {
      this.timeout(200000);

      co(function*() {
        // Createa new suite
        var suite = new Suite('test suite', {
          async: false, cycles: 10, iterations: 1000
        });

        // Add a new bencmark
        suite.addTest(
          new Benchmark('simple sync test 1')
            .set(function(context) {
              for(var i = 0; i < 1000; i++) {}
            })
        );

        suite.addTest(
          new Benchmark('simple sync test 2', { async: true })
            .set(function(context, done) {
              for(var i = 0; i < 1000; i++) {}
              done();
            })
        );

        // Add a simple reporter
        suite.addReporter(new SimpleReporter());

        // Counts of executions
        var setup = 0, teardown = 0;
        var suiteSetup = 0, suiteTeardown = 0;

        // Execute the test suite
        yield suite.execute();

        // Done
        done();
      }).catch(function(e) {
        console.log(e.stack);
      });
    });
  });
});
