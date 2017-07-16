'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redis = require('redis');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var client = void 0;

var Redis = function () {
    function Redis() {
        _classCallCheck(this, Redis);
    }

    _createClass(Redis, null, [{
        key: 'configure',
        value: function configure(options) {
            return new Promise(function (resolve, reject) {
                client = (0, _redis.createClient)(options);
                client.on('connect', function () {
                    resolve(client);
                });
                client.on('error', function (error) {
                    reject(error);
                });
            });
        }
    }, {
        key: 'client',
        get: function get() {
            return client;
        }
    }]);

    return Redis;
}();

exports.default = Redis;