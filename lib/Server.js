'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _ws = require('ws');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * HTTP/S & WebSocket Server
 * @class
 */
var Server = function () {
    /**
     * Create s Server
     * @param options - https Options
     */
    function Server() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, Server);

        // Initiate the HTTP/HTTPS Server
        /**
         * @name Server#server
         * @type http.Server
         */
        this.server = (options ? _https2.default : _http2.default).createServer(options);

        // Initiate the WebSocket Server
        /**
         * @name Server#websocket
         * @type Websocket
         */
        this.websocket = new _ws.Server({
            server: this.server
        });

        this.options = options;
    }

    /**
     * Start the Server - This will return the Promise when the server is started
     * @param {number|string} port - Port to listen to
     * @param {string} hostname - IP Address of the Interface to use
     * @returns {Promise}
     */


    _createClass(Server, [{
        key: 'start',
        value: function start() {
            var _this = this;

            var port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 80;
            var hostname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0.0.0.0';

            return new Promise(function (resolve, reject) {
                _this.server.listen(port, hostname, function () {
                    resolve();
                });
            });
        }
    }]);

    return Server;
}();

exports.default = Server;