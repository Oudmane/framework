'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var templates = void 0;

var Renderer = function () {
    function Renderer() {
        _classCallCheck(this, Renderer);
    }

    _createClass(Renderer, null, [{
        key: 'render',
        value: function render(_ref, application) {
            var _this = this;

            var body = _ref.body,
                _ref$status = _ref.status,
                status = _ref$status === undefined ? 200 : _ref$status,
                _ref$headers = _ref.headers,
                headers = _ref$headers === undefined ? {} : _ref$headers,
                _ref$template = _ref.template,
                template = _ref$template === undefined ? {} : _ref$template;

            return new Promise(function (resolve) {

                if (application.socket) resolve(body);else {

                    var readable = void 0,
                        promise = Promise.resolve();

                    promise = promise.then(function () {
                        return new Promise(function (resolve, reject) {

                            if (!_this.template) resolve({ body: body, status: status, headers: headers });else {

                                templates[template.name].render({ body: body, status: status, headers: headers, template: template }, application).then(resolve);
                            }
                        });
                    });

                    promise.then(function (_ref2) {
                        var body = _ref2.body,
                            status = _ref2.status,
                            headers = _ref2.headers;


                        if (typeof body.pipe === 'function') readable = body;else {

                            readable = new _stream.Readable();

                            readable._read = function noop() {};
                            readable.push(body);
                            readable.push(null);
                        }

                        resolve({
                            status: status || 200,
                            headers: _extends({}, _this.headers, headers),
                            body: readable
                        });
                    });
                }
            });
        }
    }, {
        key: 'loadTemplates',
        value: function loadTemplates(templatesDir) {
            return new Promise(function (resolve) {

                templates = {};

                _fs2.default.readdirSync(templatesDir).forEach(function (template) {

                    var templateDir = _path2.default.join(templatesDir, template),
                        Template = {};

                    if (_fs2.default.statSync(templateDir).isDirectory()) {

                        var templateFile = _path2.default.join(templateDir, 'index.js');

                        if (_fs2.default.existsSync(templateFile)) templates[template] = require(templateFile).default;
                    }
                });

                resolve(templates);
            });
        }
    }]);

    return Renderer;
}();

Renderer.headers = {};
Renderer.template = null;

exports.default = Renderer;