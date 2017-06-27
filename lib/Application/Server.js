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
        );_this.http.on('request', _this.request

        // When the server gets a WebSocket connection
        );_this.websocket.on('connection', function (connection) {
            _this.request(connection.upgradeReq, connection, true);
        });
        return _this;
    }

    _createClass(Server, [{
        key: 'request',
        value: function request(_request, response) {
            var socket = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


            var application = new _Application2.default(),
                authorization = (this.constructor.getAuthorizationCode || getAuthorizationCode)(_request),
                promise = Promise.resolve();

            application.http = {
                request: _request,
                response: response
            };

            promise = promise.then(function () {
                return new Promise(function (resolve, reject) {

                    Promise.all([

                    // Initialise
                    application.initiate(authorization),

                    // Build request
                    new Promise(function (resolve, reject) {

                        var body = [],
                            appRequest = new _Request2.default(_request);

                        _request.on('data', function (chunk) {
                            return body.push(chunk);
                        });

                        _request.on('end', function () {

                            appRequest.parseBody(Buffer.concat(body).toString(), _request.headers['content-type']);

                            resolve(appRequest);
                        });
                    })]).then(resolve).catch(reject);
                });
            }

            // Route
            );promise = promise.then(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    request = _ref2[1];

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

                    resolve(JSON.stringify(payload, null, 4));
                });
            }

            // Pipe


            );promise.then(function (pipe) {
                response.end(pipe);
            }).catch(function (error) {
                console.log(error);
                response.end('Error');
            });
        }
    }]);

    return Server;
}(_Server4.default);

exports.default = Server;