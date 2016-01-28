"use strict"

var S = require('fast-stats').Stats;

class ParallelStats {
  constructor(parent) {
    this.parent = parent;
    this._start = process.hrtime();
  }

  end() {
    this.parent.timings.push(process.hrtime(this._start));
  }
}

class TimeMeasure {
  constructor() {
    this._start = process.hrtime();
  }

  end() {
    return process.hrtime(this._start);
  }
}

class Stats {
  constructor() {
    this.totalDuration = null;
    this.startHrTime = null
    this.startIterationHrTime = null;
    this.timings = [];
    this.stats = new S();
  }

  start() {
    this.startHrTime = process.hrtime();
  }

  push(entries) {
    this.stats.push(entries);
  }

  end() {
    this.totalDuration = process.hrtime(this.startHrTime);

    // Feed the stats object
    this.stats.push(this.timings.map(function(x) {
      return (x[0] * 1e9 + x[1]) / (1000);
    }));
  }

  duration() {
    return (this.totalDuration[0] * 1e9 + this.totalDuration[1]) / (1000);
  }

  // Simple iteration measurement
  startIteration() {
    this.startIterationHrTime = process.hrtime();
  }

  endIteration() {
    this.timings.push(process.hrtime(this.startIterationHrTime));
  }

  // Start multiple parallel measurements
  startParallelIteration() {
    return new ParallelStats(this);
  }

  // Just return a timing object
  timer() {
    return new TimeMeasure();
  }

  percentile(v) {
    return this.stats.percentile(v);
  }

  range() {
    return this.stats.range();
  }

  amean() {
    return this.stats.amean();
  }

  mean() {
    return this.stats.mean();
  }

  median() {
    return this.stats.median();
  }

  stdDev() {
    return this.stats.σ();
  }

  gstdDev() {
    return this.stats.gstddev();
  }

  moe() {
    return this.stats.moe();
  }
}

module.exports = Stats;
