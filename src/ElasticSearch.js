import {
    Client
} from 'elasticsearch'

let client

class ElasticSearch {
    static configure(options) {
        return new Promise(resolve => {
            client = new Client(options)
            resolve(client)
        })
    }
    static get client() {
        return client
    }
}

export default ElasticSearch