"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var S = require('fast-stats').Stats;

var ParallelStats = (function () {
  function ParallelStats(parent) {
    _classCallCheck(this, ParallelStats);

    this.parent = parent;
    this._start = process.hrtime();
  }

  _createClass(ParallelStats, [{
    key: "end",
    value: function end() {
      this.parent.timings.push(process.hrtime(this._start));
    }
  }]);

  return ParallelStats;
})();

var TimeMeasure = (function () {
  function TimeMeasure() {
    _classCallCheck(this, TimeMeasure);

    this._start = process.hrtime();
  }

  _createClass(TimeMeasure, [{
    key: "end",
    value: function end() {
      return process.hrtime(this._start);
    }
  }]);

  return TimeMeasure;
})();

var Stats = (function () {
  function Stats() {
    _classCallCheck(this, Stats);

    this.totalDuration = null;
    this.startHrTime = null;
    this.startIterationHrTime = null;
    this.timings = [];
    this.stats = new S();
  }

  _createClass(Stats, [{
    key: "start",
    value: function start() {
      this.startHrTime = process.hrtime();
    }
  }, {
    key: "push",
    value: function push(entries) {
      this.stats.push(entries);
    }
  }, {
    key: "end",
    value: function end() {
      this.totalDuration = process.hrtime(this.startHrTime);

      // Feed the stats object
      this.stats.push(this.timings.map(function (x) {
        return (x[0] * 1e9 + x[1]) / 1000;
      }));
    }
  }, {
    key: "duration",
    value: function duration() {
      return (this.totalDuration[0] * 1e9 + this.totalDuration[1]) / 1000;
    }

    // Simple iteration measurement

  }, {
    key: "startIteration",
    value: function startIteration() {
      this.startIterationHrTime = process.hrtime();
    }
  }, {
    key: "endIteration",
    value: function endIteration() {
      this.timings.push(process.hrtime(this.startIterationHrTime));
    }

    // Start multiple parallel measurements

  }, {
    key: "startParallelIteration",
    value: function startParallelIteration() {
      return new ParallelStats(this);
    }

    // Just return a timing object

  }, {
    key: "timer",
    value: function timer() {
      return new TimeMeasure();
    }
  }, {
    key: "percentile",
    value: function percentile(v) {
      return this.stats.percentile(v);
    }
  }, {
    key: "range",
    value: function range() {
      return this.stats.range();
    }
  }, {
    key: "amean",
    value: function amean() {
      return this.stats.amean();
    }
  }, {
    key: "mean",
    value: function mean() {
      return this.stats.mean();
    }
  }, {
    key: "median",
    value: function median() {
      return this.stats.median();
    }
  }, {
    key: "stdDev",
    value: function stdDev() {
      return this.stats.σ();
    }
  }, {
    key: "gstdDev",
    value: function gstdDev() {
      return this.stats.gstddev();
    }
  }, {
    key: "moe",
    value: function moe() {
      return this.stats.moe();
    }
  }]);

  return Stats;
})();

module.exports = Stats;
