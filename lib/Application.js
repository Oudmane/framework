'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Server = require('./Application/Server');

var _Server2 = _interopRequireDefault(_Server);

var _Renderer = require('./Application/Renderer');

var _Renderer2 = _interopRequireDefault(_Renderer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var trigger = function trigger(event, params) {
    return Promise.all(Application.triggers[event].map(function (e) {
        return new Promise(function (resolve, reject) {
            Promise.resolve(e.apply(undefined, _toConsumableArray(params))).then(resolve).catch(function (error) {
                reject(error);
            });
        });
    }));
},
    loadRoutesAndTriggers = function loadRoutesAndTriggers(Component, component, task) {
    routes.forEach(function (trigger) {
        if (Component[task][trigger]) if (Array.isArray(Component[task][trigger])) Component[task][trigger].forEach(function (route) {
            Application.routes.push(_extends({
                component: component,
                task: task
            }, route));
        });else Application.routes.push(_extends({
            component: component,
            task: task
        }, Component[task][trigger]));
    });
    triggers.forEach(function (trigger) {
        if (Component[task][trigger]) if (Array.isArray(Component[task][trigger])) Component[task][trigger].forEach(function (callback) {
            Application.triggers[trigger].push(callback);
        });else Application.triggers[trigger].push(Component[task][trigger]);
    });
},
    triggers = ['beforeInitiate', 'initiate', 'afterInitiate', 'beforeLoad', 'afterLoad'],
    routes = ['route', 'routes'];

var components = null,
    modules = null;

/**
 * @class Application
 */

var Application = function () {
    function Application() {
        _classCallCheck(this, Application);

        /**
         * @name Application#http
         * @type {{request: http.ClientRequest, response: http.ServerResponse}}
         */
        this.http = {
            /**
             * @type {http.ClientRequest}
             * @name Application#http#request
             */
            request: null,
            /**
             * @type {http.ServerResponse}
             * @name Application#http#request
             */
            response: null
        };
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

            return new Promise(function (resolve, reject) {

                if (Application.routes.length) Promise.race(Application.routes.map(function (route) {
                    return new Promise(function (resolve, reject) {
                        Promise.resolve(route.uri.test(request.path)).then(function (isRouted) {
                            if (isRouted) resolve(_extends({
                                request: request
                            }, route));
                        });
                    });
                })).then(resolve).catch(reject);else reject('No routes');
            });
        }
    }, {
        key: 'load',
        value: function load(route) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var component = route.component,
                    task = route.task,
                    _payload = {};


                trigger('beforeLoad', [_this2, route, _payload]).then(function () {

                    return new Promise(function (resolve, reject) {

                        if (!components) reject('Components unloaded');else if (!components[component]) reject('Component not found');else if (!components[component][task]) reject('task not found');else components[component][task].run(_this2, route, _payload).then(function (payload) {

                            resolve(_payload = Object.assign(_payload, payload));
                        }).catch(reject);
                    });
                }).then(function (payload) {
                    return trigger('afterLoad', [_this2, route, _payload]);
                }).then(function () {

                    resolve(_payload);
                }).catch(reject);
            });
        }
    }, {
        key: 'render',
        value: function render(payload) {
            var socket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return this.constructor.Renderer.render(payload, socket);
        }
    }], [{
        key: 'loadComponents',
        value: function loadComponents(componentsDir) {
            return new Promise(function (resolve) {
                components = {};
                _fs2.default.readdirSync(componentsDir).forEach(function (component) {
                    var componentDir = _path2.default.join(componentsDir, component),
                        Component = {};
                    if (_fs2.default.statSync(componentDir).isDirectory()) {
                        var controllerFile = _path2.default.join(componentDir, 'controller.js'),
                            tasksDir = _path2.default.join(componentDir, 'tasks');
                        if (_fs2.default.existsSync(controllerFile)) {
                            Component.default = require(controllerFile).default;
                            loadRoutesAndTriggers(Component, component, 'default');
                        }
                        if (_fs2.default.existsSync(tasksDir)) _fs2.default.readdirSync(tasksDir).forEach(function (task) {
                            var taskDir = _path2.default.join(tasksDir, task);
                            if (_fs2.default.statSync(componentDir).isDirectory()) {
                                var taskFile = _path2.default.join(taskDir, 'controller.js');
                                if (_fs2.default.existsSync(taskFile)) {
                                    Component[task] = require(taskFile).default;
                                    loadRoutesAndTriggers(Component, component, task);
                                }
                            }
                        });
                        components[component] = Component;
                    }
                });
                console.log(components);
                resolve(components);
            });
        }
    }]);

    return Application;
}();

Application.routes = [];
Application.triggers = {};

triggers.forEach(function (trigger) {
    Application.triggers[trigger] = [];
});

Application.Server = _Server2.default;
Application.Renderer = _Renderer2.default;

exports.default = Application;