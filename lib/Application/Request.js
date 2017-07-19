'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _cookie = require('cookie');

var _cookie2 = _interopRequireDefault(_cookie);

var _parseMultipart = require('parse-multipart');

var _parseMultipart2 = _interopRequireDefault(_parseMultipart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function () {
    function Request(request) {
        var socket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, Request);

        this.id = '';
        this.parseURL(request.url);
        this.method = request.method;
        this.headers = request.headers;
        this.cookies = {};
        if (this.headers.cookie) this.cookies = _cookie2.default.parse(this.headers.cookie);
        this.ip = this.headers['x-forwarded-for'] || request.connection.remoteAddress;
        this.body = null;
        this.bodyObject = {};
        this.files = [];
        this.socket = socket;
    }

    _createClass(Request, [{
        key: 'parseURL',
        value: function parseURL(url) {
            url = _url2.default.parse(url, true);
            this.uri = url.path;
            this.path = url.pathname;
            this.query = url.search.replace(/^\?/, '');
            this.files = [];
            this.pathArray = url.pathname.replace(/^\//, '').split('/');
            this.queryObject = url.query;
        }
    }, {
        key: 'parseBody',
        value: function parseBody(body) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            this.body = body;
            var typeArray = type.trim().split(';');
            switch (typeArray[0]) {
                case 'application/json':
                case 'json':
                    this.bodyObject = JSON.parse(body);
                    break;
                case 'object':
                    Object.assign(this.bodyObject, body);
                    break;
                case 'application/x-www-form-urlencoded':
                default:
                    this.bodyObject = _querystring2.default.parse(body);
                    break;
                case 'multipart/form-data':
                    try {
                        var boundary = _parseMultipart2.default.getBoundary(type);
                        this.files = _parseMultipart2.default.Parse(Buffer.from(body, 'utf8'), boundary);
                    } catch (e) {
                        this.files = [];
                    }
                    break;
            }
        }
    }, {
        key: 'append',
        value: function append(request) {
            this.method = request.method || 'GET';
            this.id = request.id || '';
            this.parseURL(request.url);
            this.parseBody(request.data || {}, 'object');
        }
    }, {
        key: 'isInPath',
        value: function isInPath(component) {
            return this.pathArray.indexOf(component.toString()) !== -1;
        }
    }, {
        key: 'nextInPath',
        value: function nextInPath(component) {
            var index = void 0;
            if ((index = this.pathArray.indexOf(component.toString())) !== -1) if (typeof this.pathArray[++index] !== 'undefined') return this.pathArray[index];
            return false;
        }
    }, {
        key: 'isInPOST',
        value: function isInPOST(key) {
            return typeof this.bodyObject[key] !== 'undefined';
        }
    }, {
        key: 'getPOST',
        value: function getPOST(key) {
            return this.isInPOST(key) ? this.bodyObject[key] : undefined;
        }
    }, {
        key: 'isInGET',
        value: function isInGET(key) {
            return typeof this.queryObject[key] !== 'undefined';
        }
    }, {
        key: 'getGET',
        value: function getGET(key) {
            return this.isInGET(key) ? this.queryObject[key] : undefined;
        }
    }]);

    return Request;
}();

exports.default = Request;