import _Server from '../Server'
import Application from '../Application'
import Request from './Request'

const getAuthorizationCode = (request) => {
    return request.headers.authorization || (() => {
        let authorization = ''
        if(request.headers.cookie) {
            request.headers.cookie.split('; ').forEach(cookie => {
                let [key, value] = cookie.split('=')
                if(key == 'session')
                    authorization = value
            })
        }
        return authorization
    })()
}

class Server extends _Server {
    constructor(options = null) {

        // Launch super constructor
        super(options)

        // When the server is listening
        this.http.on('listening', () => {
            console.log(`Server is listening on ${this.options.hostname}:${this.options.port}`)
        })

        // When the server gets a HTTP request
        this.http.on('request', this.request)

        // When the server gets a WebSocket connection
        this.websocket.on('connection', (connection) => {
            this.request(connection.upgradeReq, connection, true)
        })
    }
    request(request, response, socket = false) {

        let application = new Application(),
            authorization = (this.constructor.getAuthorizationCode || getAuthorizationCode)(request),
            promise = Promise.resolve()

        application.http = {
            request,
            response
        }

        promise = promise.then(() => new Promise((resolve, reject) => {

            Promise.all([


                // Initialise
                application.initiate(authorization),

                // Build request
                new Promise((resolve, reject) => {

                    let body = [],
                        appRequest = new Request(request)

                    request.on('data', chunk => body.push(chunk))

                    request.on('end', () => {

                        appRequest.parseBody(Buffer.concat(body).toString(), request.headers['content-type'])

                        resolve(appRequest)

                    })

                })

            ]).then(resolve).catch(reject)

        }))


        // Route
        promise = promise.then(([, request]) => new Promise((resolve, reject) => {

            application.route(request).then(resolve).catch(reject)

        }))

        // Load
        promise = promise.then(route => new Promise((resolve, reject) => {

            application.load(route).then(payload => {

                resolve(payload)

            }).catch(reject)

        }))

        // Render
        promise = promise.then(payload => new Promise((resolve, reject) => {

            resolve(JSON.stringify(payload, null, 4))

        }))


        // Pipe



        promise.then(pipe => {
            response.end(pipe)
        }).catch(error => {
            console.log(error)
            response.end('Error')
        })
    }
}

export default Server