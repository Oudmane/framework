'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cron = require('cron');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var jobs = {},
    events = new _events2.default();

var CronJob = function () {
    function CronJob() {
        _classCallCheck(this, CronJob);
    }

    _createClass(CronJob, null, [{
        key: 'start',
        value: function start(id, cronTime, task, data) {
            var _this = this;

            var timeZone = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'Universal';

            jobs[id] = new _cron.CronJob({
                cronTime: cronTime,
                timeZone: timeZone,
                onTick: function onTick() {
                    _this.emit(task, data, id);
                    _this.emit('tick', id);
                },
                onComplete: function onComplete() {
                    _this.emit('complete', id);
                }
            });
            jobs[id].start();
            this.emit('init', id);
        }
    }, {
        key: 'stop',
        value: function stop(id) {
            if (jobs[id]) {
                jobs[id].stop();
                delete jobs[id];
            }
        }
    }, {
        key: 'on',
        value: function on() {
            events.on.apply(this, arguments);
        }
    }, {
        key: 'once',
        value: function once() {
            events.once.apply(this, arguments);
        }
    }, {
        key: 'emit',
        value: function emit() {
            events.emit.apply(this, arguments);
        }
    }]);

    return CronJob;
}();

exports.default = CronJob;