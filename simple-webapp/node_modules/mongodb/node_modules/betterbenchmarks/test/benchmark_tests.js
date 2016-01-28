"use strict"

var co = require('co'),
  f = require('util').format,
  assert = require('assert');

var Benchmark = require('../').Benchmark,
  Stats = require('../').Stats;

// Polyfill Promise if none exists
if(!global.Promise) {
  require('es6-promise').polyfill();
}

// Get babel polyfill
require("babel-polyfill");

describe('Benchmark', function() {
  describe('sync', function() {
    it('simple sync benchmark', function(done) {
      co(function*() {
        // Create a new benchmark instance
        var bench = new Benchmark('simple sync test', {
          async: false, cycles: 10, iterations: 1000
        })
        .set(function(context) {
          var size = 1000;
          var a = 1;

          for(var i = 0; i < size; i++) {
            a = a + a;
          }
        });

        // Execute the benchmark
        yield bench.execute();

        // Tests
        assert.equal(10, bench.stats.length);

        // Finish up test
        done();
      }).catch(function(err) {
        console.log(err.stack);
      });
    });
  });

  describe('async', function() {
    it('simple async benchmark', function(done) {
      co(function*() {
        // Create a new benchmark instance
        var bench = new Benchmark('simple sync test', {
          async: true, cycles: 10, iterations: 1000
        })
        .set(function(context, done) {
          var size = 1000;
          var a = 1;

          for(var i = 0; i < size; i++) {
            a = a + a;
          }

          done();
        });

        // Execute the benchmark
        yield bench.execute();

        // Tests
        assert.equal(10, bench.stats.length);

        // Finish up test
        done();
      }).catch(function(err) {
        console.log(err.stack);
      });
    });
  });

  describe('hooks', function() {
    it('exercise custom start/end and startcycle/endcycle functions', function(done) {
      this.timeout(200000);

      co(function*() {

        // Expected triggered
        var setup = 0;
        var teardown = 0;

        // Create a new benchmark instance
        var bench = new Benchmark('simple sync test', {
          async: false, cycles: 10, iterations: 1000
        })
        .set(function(context) {
          var size = 1000;
          var a = 1;

          for(var i = 0; i < size; i++) {
            a = a + a;
          }
        })
        .setup(function(context, options, callback) {
          setup = setup + 1;
          // console.log("---------------------------------------- bench setup")
          // Set the message byte size
          // context.size = 1024;
          callback();
        })
        .setup(function(context, options, callback) {
          setup = setup + 1;
          callback();
        })
        .teardown(function(context, stats, options, callback) {
          teardown = teardown + 1;
          callback();
        })
        .teardown(function(context, stats, options, callback) {
          teardown = teardown + 1;
          // console.log("---------------------------------------- bench teardown")
          // console.dir(context)
          // console.log(stats.length)
          // var data = stats.map(function(x) {
          //   // Calculate total bytes for the iterations
          //   var bytes = context.size * options.iterations;
          //   // Calculate the bytes per second
          //   var bytesPerSecond = bytes * ((1000 * 1000)/x.duration());
          //   // Calculate the kb per second
          //   var kbPerSecond = bytesPerSecond / 1024;
          //   // Calculate the mb per second
          //   var mbPerSecond = kbPerSecond / 1024;
          //
          //   console.log(f('[%s] %s MB/s', x.duration(), Math.round(mbPerSecond * 100)/100));
          //   return mbPerSecond;
          // });
          //
          // var stats = new Stats();
          // stats.push(data);
          //
          // console.log("------------------------------------------- final breakdown")
          // console.dir(stats)
          // console.log(f("Median = %s MB/s", Math.round(stats.median() * 100)/100))
          // console.log(f("10 percentile = %s MB/s", Math.round(stats.percentile(10) * 100)/100))
          // console.log(f("95 percentile = %s MB/s", Math.round(stats.percentile(95) * 100)/100))
          // console.log(f("99 percentile = %s MB/s", Math.round(stats.percentile(99) * 100)/100))
          // console.log(f("σ = %s MB/s", Math.round(stats.σ() * 100)/100))
          // console.log(f("min = %s MB/s", Math.round(stats.range()[0] * 100)/100))
          // console.log(f("max = %s MB/s", Math.round(stats.range()[1] * 100)/100))
          callback();
        });

        // Execute the benchmark
        yield bench.execute();

        // Tests
        assert.equal(10, bench.stats.length);
        assert.equal(2, setup);
        assert.equal(2, teardown);

        // Finish up test
        done();
      }).catch(function(err) {
        console.log(err.stack);
      });
    });
  });
});
