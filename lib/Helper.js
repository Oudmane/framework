'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Helper = function () {
    function Helper() {
        _classCallCheck(this, Helper);
    }

    _createClass(Helper, null, [{
        key: 'getCryptedPassword',
        value: function getCryptedPassword(plaintext) {
            var salt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';


            return _crypto2.default.createHash('md5').update(salt ? plaintext + salt : plaintext).digest('hex');
        }
    }, {
        key: 'genRandomPassword',
        value: function genRandomPassword() {
            var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
            var full = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var salt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';


            if (!salt) salt = full ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : 'abcdefghijklmnopqrstuvwxyz0123456789';

            var base = salt.length,
                makepass = '',
                random = this.genRandomBytes(length + 1),
                shift = random.charCodeAt(0);

            for (var i = 1; i <= length; i++) {

                makepass += salt[(shift + random.charCodeAt(i)) % base];

                shift += random.charCodeAt(i);
            }

            return makepass;
        }
    }, {
        key: 'genRandomBytes',
        value: function genRandomBytes() {
            var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;


            return _crypto2.default.randomBytes(length).toString('hex');
        }
    }]);

    return Helper;
}();

exports.default = Helper;