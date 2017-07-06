'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
    var changes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
    var errors = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    var preKey = arguments[6];

    return Promise.all(Object.keys(values).map(function (key) {
        return new Promise(function (resolve, reject) {

            // if the key exists in types
            if (typeof types[key] != 'undefined') {

                    // if the type has a load function
                    if (typeof types[key].load == 'function')

                        // load it
                        types[key].load(values[key]).then(function (value) {

                            if (trackChange) changes.push('' + (preKey ? preKey + '.' : '') + key);

                            object[key] = value;

                            resolve();
                        }).catch(reject

                        // no load function
                        );else switch (types[key].name || types[key].constructor.name) {

                        case 'Object':

                            _bind(object[key], values[key], types[key], trackChange, changes, errors, '' + (preKey ? preKey + '.' : '') + key).then(resolve).catch(reject);

                            break;

                        case 'Array':
                            var _types$key = _slicedToArray(types[key], 1),
                                type = _types$key[0];

                            object[key] = [];

                            Promise.all((values[key] || []).map(function (value, i) {
                                return new Promise(function (resolve, reject) {

                                    if (typeof type.load == 'function') type.load(value).then(function (loadedValue) {

                                        if (trackChange) changes.push('' + (preKey ? preKey + '.' : '') + key + '.' + i);

                                        resolve(loadedValue);
                                    }).catch(reject);else if (type.constructor.name == 'Object') {

                                        var newValue = {};

                                        build(newValue, type);

                                        _bind(newValue, value, type, trackChange, changes, errors, '' + (preKey ? preKey + '.' : '') + key + '.' + i).then(function () {

                                            resolve(newValue);
                                        }).catch(reject);
                                    } else {

                                        if (trackChange) changes.push('' + (preKey ? preKey + '.' : '') + key + '.' + i);

                                        resolve(new type(value));
                                    }
                                });
                            })).then(function (values) {

                                object[key] = values;

                                resolve();
                            }).catch(reject);

                            break;

                        default:

                            try {

                                object[key] = new types[key](values[key]);

                                if (trackChange) changes.push('' + (preKey ? preKey + '.' : '') + key);

                                resolve();
                            } catch (error) {

                                reject(error);
                            }

                            break;

                    }
            } else resolve();
        });
    })).then(function () {
        return new Promise(function (resolve) {

            resolve({
                changed: changes.length ? true : false,
                changes: changes,
                erred: Object.keys(errors).length ? true : false,
                errors: errors
            });
        });
    });
};

var Entity = function () {
    function Entity() {
        _classCallCheck(this, Entity);

        build(this, this.constructor.properties);
    }

    _createClass(Entity, [{
        key: 'bind',
        value: function bind(data) {
            var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


            return _bind(this, data, this.constructor.properties, change).then(function (bind) {
                return new Promise(function (resolve) {

                    resolve(bind);
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
            var _this = this;

            return this.bind(data).then(function (bind) {
                return _this.save();
            });
        }
    }]);

    return Entity;
}();

Entity.properties = {};

exports.default = Entity;