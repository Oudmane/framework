'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var trigger = function trigger(event, params) {
    return Promise.all(Application[event].map(function (e) {
        return new Promise(function (resolve, reject) {
            Promise.resolve(e.apply(undefined, _toConsumableArray(params))).then(resolve).catch(function (error) {
                error.chaine.unshift(event);
                reject(error);
            });
        });
    }));
};

var Application = function () {
    function Application() {
        _classCallCheck(this, Application);
    }

    _createClass(Application, [{
        key: 'initiate',
        value: function initiate(authorization) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                trigger('beforeInitiate', [authorization, _this]).then(function () {
                    return trigger('initiate', [authorization, _this]);
                }).then(function () {
                    return trigger('afterInitiate', [authorization, _this]);
                }).then(resolve).catch(reject);
            });
        }
    }, {
        key: 'route',
        value: function route() {
            var request = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        }
    }]);

    return Application;
}();

Application.beforeInitiate = [];
Application.initiate = [];
Application.afterInitiate = [];

exports.default = Application;