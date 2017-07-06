'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Server3 = require('../Server');

var _Server4 = _interopRequireDefault(_Server3);

var _Application = require('../Application');

var _Application2 = _interopRequireDefault(_Application);

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var getAuthorizationCode = function getAuthorizationCode(request) {
    return request.headers.authorization || function () {
        var authorization = '';
        if (request.headers.cookie) {
            request.headers.cookie.split('; ').forEach(function (cookie) {
                var _cookie$split = cookie.split('='),
                    _cookie$split2 = _slicedToArray(_cookie$split, 2),
                    key = _cookie$split2[0],
                    value = _cookie$split2[1];

                if (key == 'session') authorization = value;
            });
        }
        return authorization;
    }();
};

var Server = function (_Server2) {
    _inherits(Server, _Server2);

    function Server() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, Server);

        // When the server is listening
        var _this = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this, options));

        // Launch super constructor


        _this.http.on('listening', function () {
            console.log('Server is listening on ' + _this.options.hostname + ':' + _this.options.port);
        }

        // When the server gets a HTTP request
        );_this.http.on('request', function (request, response) {

            _this.request(request, response);
        }

        // When the server gets a WebSocket connection
        );_this.websocket.on('connection', function (connection, request) {

            _this.request(request, connection, true);
        });
        return _this;
    }

    /**
     *
     * @param  {http.ClientRequest} request
     * @param {http.ServerResponse|http.IncomingMessage} response
     * @param {boolean} [socket=false]
     */


    _createClass(Server, [{
        key: 'request',
        value: function request(_request, response) {
            var _this2 = this;

            var socket = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


            /**
             *
             * @type {Application}
             */
            var application = new _Application2.default(),

            /**
             * @type {string}
             */
            authorization = (this.constructor.getAuthorizationCode || getAuthorizationCode)(_request);

            application.http = {
                request: _request,
                response: response
            };

            application.initiate(authorization).then(function () {

                if (socket) {

                    response.on('message', function (message) {

                        message = JSON.parse(message);

                        var appRequest = new _Request2.default(_request, true);

                        appRequest.append(message);

                        _this2.process({
                            application: application,
                            request: appRequest,
                            socket: socket
                        });
                    });
                } else {

                    var body = [],
                        appRequest = new _Request2.default(_request);

                    _request.on('data', function (chunk) {
                        return body.push(chunk);
                    });

                    _request.on('end', function () {

                        appRequest.parseBody(Buffer.concat(body).toString(), _request.headers['content-type']);

                        _this2.process({
                            application: application,
                            request: appRequest,
                            socket: socket
                        });
                    });
                }
            }).catch(function (error) {

                console.log(error);

                if (socket) {

                    response.send('Error');
                    response.terminate();
                } else {

                    response.end('Error');
                }
            });
        }
    }, {
        key: 'process',
        value: function process(_ref) {
            var application = _ref.application,
                request = _ref.request,
                socket = _ref.socket;


            var promise = Promise.resolve(request

            // Route
            );promise = promise.then(function (request) {
                return new Promise(function (resolve, reject) {

                    application.route(request).then(resolve).catch(reject);
                });
            }

            // Load
            );promise = promise.then(function (route) {
                return new Promise(function (resolve, reject) {

                    application.load(route).then(function (payload) {

                        resolve(payload);
                    }).catch(reject);
                });
            }

            // Render
            );promise = promise.then(function (payload) {
                return new Promise(function (resolve, reject) {

                    application.render(payload, socket).then(resolve);
                });
            }

            // Pipe
            );if (socket) promise.then(function (pipe) {

                application.http.response.send(pipe);
            }).catch(function (error) {

                console.log(error);
                application.http.response.send('Error');
            });else promise.then(function (pipe) {
                var body = pipe.body,
                    status = pipe.status,
                    headers = pipe.headers;


                application.http.response.writeHead(status, headers);

                body.pipe(application.http.response);
            }).catch(function (error) {

                console.log(error);
                application.http.response.end('Error');
            });
        }
    }]);

    return Server;
}(_Server4.default);

exports.default = Server;