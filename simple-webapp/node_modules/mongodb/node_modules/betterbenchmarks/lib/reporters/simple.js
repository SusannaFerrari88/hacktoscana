"use strict"

var colors = require('colors'),
  f = require('util').format,
  Table = require('cli-table'),
  Stats = require('../stats');

var tables = [];
var table = null;

class SimpleReporter {
  constructor() {
  }

  suiteSetup(suite) {
    console.log(f('Starting suite [%s]', suite.title.bold.white));
  }

  benchmarkSetup(suite, benchmark) {
    // console.log("  starting benchmark : " + benchmark.title)
    table = new Table({
      head: ['Suite'.white.bold, 'Benchmark'.white.bold, 'Measure'.white.bold, 'Value'.white.bold],
      colWidth: [100, 200, 200, 300]
    })
  }

  benchmarkTeardown(suite, benchmark) {
    // Aggregate up all timings
    var finalStats = new Stats();

    // For each of the recorded stats add the timings together
    for(var i = 0; i < benchmark.stats.length; i++) {
      // Convert high resolution timings to microseconds
      finalStats.push(benchmark.stats[i].timings.map(function(x) {
        return (x[0] * 1e9 + x[1]) / (1000);
      }));
    }

    // Push the sute and benchmark title as well as Median value
    table.push([suite.title, benchmark.title, 'Median'.green, f('%s microseconds', Math.round(finalStats.median() * 100)/100)]);

    // Get the different values
    table.push(['', '', 'stdDev'.green, f('%s microseconds', Math.round(finalStats.stdDev() * 100)/100)]);
    table.push(['', '', '[Min, Max]'.green,
      f('[%s, %s] microseconds'
        , Math.round(finalStats.range()[0] * 100)/100
        , Math.round(finalStats.range()[1] * 100)/100
      )]);
    table.push(['', '', '10 percentile'.green, f('%s microseconds', Math.round(finalStats.percentile(10) * 100)/100)]);
    table.push(['', '', '25 percentile'.green, f('%s microseconds', Math.round(finalStats.percentile(25) * 100)/100)]);
    table.push(['', '', '75 percentile'.green, f('%s microseconds', Math.round(finalStats.percentile(75) * 100)/100)]);
    table.push(['', '', '95 percentile'.green, f('%s microseconds', Math.round(finalStats.percentile(95) * 100)/100)]);
    table.push(['', '', '98 percentile'.green, f('%s microseconds', Math.round(finalStats.percentile(98) * 100)/100)]);
    table.push(['', '', '99 percentile'.green, f('%s microseconds', Math.round(finalStats.percentile(99) * 100)/100)]);

    // Turn table into string and print to console
    console.log(table.toString());
  }
}

module.exports = SimpleReporter;
