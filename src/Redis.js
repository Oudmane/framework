import {createClient} from 'redis'

let client

class Redis {

    static configure(options) {
        return new Promise((resolve, reject) => {
            client = createClient(options)
            client.on('connect', () => {
                resolve(client)
            })
            client.on('error', error => {
                reject(error)
            })
        })
    }

    static get client() {
        return client
    }

}

export default Redis