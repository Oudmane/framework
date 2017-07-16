'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Renderer = function () {
    function Renderer() {
        _classCallCheck(this, Renderer);
    }

    _createClass(Renderer, null, [{
        key: 'render',
        value: function render(_ref) {
            var _this = this;

            var body = _ref.body,
                _ref$status = _ref.status,
                status = _ref$status === undefined ? 200 : _ref$status,
                _ref$headers = _ref.headers,
                headers = _ref$headers === undefined ? {} : _ref$headers;
            var socket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return new Promise(function (resolve) {

                if (socket) resolve(body);else {

                    var readable = new _stream.Readable();

                    readable._read = function noop() {};
                    readable.push(body);
                    readable.push(null);

                    resolve({
                        status: status || 200,
                        headers: _extends({}, _this.headers, headers),
                        body: readable
                    });
                }
            });
        }
    }]);

    return Renderer;
}();

Renderer.headers = {};

exports.default = Renderer;