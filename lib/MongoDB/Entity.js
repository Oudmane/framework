'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Entity3 = require('../Entity');

var _Entity4 = _interopRequireDefault(_Entity3);

var _MongoDB = require('../MongoDB');

var _MongoDB2 = _interopRequireDefault(_MongoDB);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var objectKeys = function objectKeys(object, columns) {

    var sObject = {};

    if (typeof columns === 'undefined') columns = Object.keys(object.constructor.properties || object);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;


            if (object[key] === null) sObject[key] = object[key];else if (object[key].constructor.name === 'Object') sObject[key] = objectKeys(object[key]);else if (object[key].constructor.name === 'Array') sObject[key] = object[key].map(function (element) {
                return element.valueOf();
            });else sObject[key] = object[key].valueOf();
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

    return sObject;
};

var Entity = function (_Entity2) {
    _inherits(Entity, _Entity2);

    function Entity() {
        _classCallCheck(this, Entity);

        return _possibleConstructorReturn(this, (Entity.__proto__ || Object.getPrototypeOf(Entity)).apply(this, arguments));
    }

    _createClass(Entity, [{
        key: 'save',
        value: function save() {
            var _this2 = this;

            if (this.id && !this.isChanged()) return Promise.resolve();

            var isNew = !this.id.valueOf();

            return new Promise(function (resolve, reject) {

                var columns = isNew ? Object.keys(_this2.constructor.properties) : _this2.getChanges(),
                    id = columns.indexOf('id');

                if (id > -1) columns.splice(id, 1);

                columns.reduce(function (promise, key) {

                    if (typeof _this2[key].save === 'function') return promise.then(function () {
                        return new Promise(function (next) {
                            _this2[key].save().then(next);
                        });
                    });else if (_this2[key].constructor.name === 'Array') return promise.then(function () {
                        return _this2[key].reduce(function (promise, property) {
                            return promise.then(function () {
                                return new Promise(function (saved) {
                                    if (typeof property.save === 'function') property.save().then(function () {
                                        saved();
                                    });else saved();
                                });
                            });
                        }, Promise.resolve());
                    });else return promise;
                }, Promise.resolve()).then(function () {
                    var collection = _MongoDB2.default.database.collection(_this2.constructor.collection),
                        document = objectKeys(_this2, columns),
                        task = isNew ? collection.insertOne(document) : collection.updateOne({ _id: new _MongoDB2.default.ObjectID(_this2.id.toString()) }, { $set: document });
                    task.then(function (result) {
                        return new Promise(function (next) {
                            if (result.insertedId) _this2.bind({ id: result.insertedId }).then(next);else next();
                        });
                    }).then(function () {

                        _this2.constructor.emit(isNew ? 'new' : 'edit', _this2);

                        _this2.constructor.emit('save', _this2, isNew);

                        resolve();
                    });
                }).catch(reject);
            });
        }
    }, {
        key: 'valueOf',
        value: function valueOf() {
            return new _MongoDB2.default.ObjectID(this.id.toString());
        }
    }], [{
        key: 'load',
        value: function load(query) {
            var _this3 = this;

            if (!query) return Promise.resolve(new this());

            if (query.constructor && query.constructor.name === this.name) return Promise.resolve(query);

            switch (typeof query === 'undefined' ? 'undefined' : _typeof(query)) {
                case 'object':
                    break;
                default:
                    if (_MongoDB2.default.ObjectID.isValid(query)) query = { _id: new _MongoDB2.default.ObjectID(query) };else return Promise.resolve(new this());
                    break;
            }
            return new Promise(function (resolve, reject) {
                _MongoDB2.default.database.collection(_this3.collection).findOne(query).then(function (document) {

                    var entity = new _this3();

                    if (document) {
                        document['id'] = document['_id'];
                        delete document['_id'];
                        entity.bind(document, false).then(function () {
                            resolve(entity);
                        });
                    } else resolve(entity);
                }).catch(reject);
            });
        }
    }, {
        key: 'loadAll',
        value: function loadAll() {
            var _this4 = this;

            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return new Promise(function (resolve, reject) {

                var cursor = _MongoDB2.default.database.collection(_this4.collection).find(query);

                if (options.order) cursor.sort(options.order);

                if (options.skip) cursor.skip(options.skip);

                if (options.limit) cursor.limit(options.limit);

                cursor.toArray().then(function (documents) {

                    Promise.all(documents.map(function (entity) {
                        return new Promise(function (resolve) {
                            var object = new _this4();
                            entity['id'] = entity['_id'];
                            delete entity['_id'];
                            object.bind(entity, false).then(function () {
                                resolve(object);
                            });
                        });
                    })).then(resolve);
                }).catch(reject);
            });
        }
    }]);

    return Entity;
}(_Entity4.default);

Entity.collection = '';

exports.default = Entity;