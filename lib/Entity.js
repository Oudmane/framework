'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var build = function build(object, properties) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {

        for (var _iterator = Object.keys(properties)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;


            switch (properties[key].name || properties[key].constructor.name) {

                case 'Object':

                    build(object[key] = {}, properties[key]);

                    break;

                case 'Array':

                    object[key] = [];

                    break;

                default:

                    object[key] = new properties[key]();

                    break;

            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
},
    _bind = function _bind(object, values, types) {
    var trackChange = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var changes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new Set();
    var errors = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    var preKey = arguments[6];

    return Promise.all(Object.keys(values).map(function (key) {
        return new Promise(function (resolve, reject) {

            // if the key exists in types
            if (typeof types[key] !== 'undefined') {

                    // if the type has a load function
                    if (typeof types[key].load === 'function')

                        // load it
                        types[key].load(values[key]).then(function (value) {

                            if (trackChange) changes.add('' + (preKey ? preKey + '.' : '') + key);

                            object[key] = value;

                            resolve();
                        }).catch(reject);

                        // no load function
                    else switch (types[key].name || types[key].constructor.name) {

                            case 'Object':

                                _bind(object[key], values[key], types[key], trackChange, changes, errors, '' + (preKey ? preKey + '.' : '') + key).then(resolve).catch(reject);

                                break;

                            case 'Array':
                                var _types$key = _slicedToArray(types[key], 1),
                                    type = _types$key[0];

                                object[key] = [];

                                Promise.all((values[key] || []).map(function (value, i) {
                                    return new Promise(function (resolve, reject) {

                                        if (typeof type.load === 'function') type.load(value).then(function (loadedValue) {

                                            if (trackChange) changes.add('' + (preKey ? preKey + '.' : '') + key + '.' + i);

                                            resolve(loadedValue);
                                        }).catch(reject);else if (type.constructor.name === 'Object') {

                                            var newValue = {};

                                            build(newValue, type);

                                            _bind(newValue, value, type, trackChange, changes, errors, '' + (preKey ? preKey + '.' : '') + key + '.' + i).then(function () {

                                                resolve(newValue);
                                            }).catch(reject);
                                        } else {

                                            if (trackChange) changes.add('' + (preKey ? preKey + '.' : '') + key + '.' + i);

                                            resolve(new type(value));
                                        }
                                    });
                                })).then(function (values) {

                                    object[key] = values;

                                    if (!values.length) changes.add('' + (preKey ? preKey + '.' : '') + key);

                                    resolve();
                                }).catch(reject);

                                break;

                            default:

                                try {

                                    object[key] = new types[key](values[key]);

                                    if (trackChange) changes.add('' + (preKey ? preKey + '.' : '') + key);

                                    resolve();
                                } catch (error) {

                                    reject(error);
                                }

                                break;

                        }
            } else resolve();
        });
    }));
},
    events = new _events2.default();

var Entity = function () {
    function Entity() {
        var _this = this;

        _classCallCheck(this, Entity);

        build(this, this.constructor.properties);

        var changes = new Set(),
            errors = {};

        this.getChanges = function () {
            return changes;
        };
        this.isChanged = function (key) {
            return key ? changes.has(key) : !!changes.size;
        };
        this.setChange = function (key) {
            return changes.add(key);
        };

        this.getErrors = function () {
            return errors;
        };
        this.isErred = function (key) {
            return key ? errors.hasOwnProperty(key) : !!Object.keys(errors).length;
        };
        this.setError = function (key, error) {
            return errors[key] = error;
        };
        this.getError = function (key) {
            return errors[key];
        };

        this.getBind = function () {
            return {
                changed: _this.isChanged(),
                changes: _this.getChanges(),
                erred: _this.isErred(),
                errors: _this.getErrors()
            };
        };
    }

    _createClass(Entity, [{
        key: 'bind',
        value: function bind(data) {
            var _this2 = this;

            var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


            return _bind(this, data, this.constructor.properties, change, this.getChanges(), this.getErrors()).then(function () {
                return new Promise(function (resolve) {

                    resolve(_this2.getBind());
                });
            });
        }
    }, {
        key: 'save',
        value: function save() {
            return Promise.resolve();
        }
    }, {
        key: 'bindAndSave',
        value: function bindAndSave(data) {
            var _this3 = this;

            return this.bind(data).then(function () {
                return _this3.save();
            });
        }
    }, {
        key: 'map',
        value: function map(_map) {
            var _this4 = this;

            var object = {};

            _map.forEach(function (property) {

                switch (typeof property === 'undefined' ? 'undefined' : _typeof(property)) {

                    case 'string':

                        object[property] = _this4[property];

                        break;

                    case 'object':
                        var key = property.key,
                            map = property.map,
                            value = {};


                        map.split('.').forEach(function (key) {

                            value = value[key] || _this4[key];
                        });

                        object[key] = value;

                        break;
                }
            });

            return object;
        }
    }], [{
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

    return Entity;
}();

Entity.properties = {};

exports.default = Entity;