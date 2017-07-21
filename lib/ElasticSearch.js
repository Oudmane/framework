'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var client = void 0;

var ElasticSearch = function () {
    function ElasticSearch() {
        _classCallCheck(this, ElasticSearch);
    }

    _createClass(ElasticSearch, null, [{
        key: 'configure',
        value: function configure(options) {
            return new Promise(function (resolve) {
                client = new _elasticsearch.Client(options);
                resolve(client);
            });
        }
    }, {
        key: 'client',
        get: function get() {
            return client;
        }
    }]);

    return ElasticSearch;
}();

exports.default = ElasticSearch;