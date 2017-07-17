import crypto from 'crypto'

class Helper {
    static getCryptedPassword(plaintext, salt = '') {

        return crypto.createHash('md5').update(salt ? plaintext+salt : plaintext).digest('hex')

    }
    static genRandomPassword(length = 8, full = true, salt = '') {

        if(!salt)
            salt = full ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : 'abcdefghijklmnopqrstuvwxyz0123456789'

        let base = salt.length,
            makepass = '',
            random = this.genRandomBytes(length+1),
            shift = random.charCodeAt(0)

        for(var i = 1; i <= length; i++) {

            makepass += salt[(shift + random.charCodeAt(i)) % base]

            shift += random.charCodeAt(i)

        }

        return makepass

    }
    static genRandomBytes(length = 16) {

        return crypto.randomBytes(length).toString('hex')

    }
}

export default Helper