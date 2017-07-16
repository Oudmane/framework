import _Server from '../Server'
import Application from '../Application'
import Request from './Request'
import http from 'http'

const getAuthorizationCode = (request) => {
    return request.headers.authorization || (() => {
            let authorization = ''
            if (request.headers.cookie) {
                request.headers.cookie.split(';').forEach(cookie => {
                    let [key, value] = cookie.trim().split('=')
                    if (key === 'session')
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
        // this.http.on('listening', () => {
        //     console.log(`Server is listening on ${this.options.hostname}:${this.options.port}`)
        // })

        // When the server gets a HTTP request
        this.http.on('request', (request, response) => {

            this.request(request, response)

        })

        // When the server gets a WebSocket connection
        this.websocket.on('connection', (connection, request) => {

            this.request(request, connection, true)

        })
    }

    /**
     *
     * @param  {http.ClientRequest} request
     * @param {http.ServerResponse|http.IncomingMessage} response
     * @param {boolean} [socket=false]
     */
    request(request, response, socket = false) {

        /**
         *
         * @type {Application}
         */
        let application = new Application(),
            /**
             * @type {string}
             */
            authorization = (this.constructor.getAuthorizationCode || getAuthorizationCode)(request)

        application.http = {
            request,
            response
        }

        application.initiate(authorization).then(() => {

            if (socket) {

                response.on('message', message => {

                    message = JSON.parse(message)

                    let appRequest = new Request(request, true)

                    appRequest.append(message)

                    this.process({
                        application,
                        request: appRequest,
                        socket
                    })

                })

            } else {

                let body = [],
                    appRequest = new Request(request)

                request.on('data', chunk => body.push(chunk))

                request.on('end', () => {

                    appRequest.parseBody(Buffer.concat(body).toString(), request.headers['content-type'])

                    this.process({
                        application,
                        request: appRequest,
                        socket
                    })

                })

            }

        }).catch(error => {

            console.log(error)

            if (socket) {

                response.send('Error')
                response.terminate()

            } else {

                response.end('Error')

            }

        })

    }

    process({application, request, socket}) {

        let promise = Promise.resolve(request)

        // Route
        promise = promise.then(request => new Promise((resolve, reject) => {

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

            application.render(payload, socket).then(resolve)

        }))


        // Pipe
        if (socket)

            promise.then(pipe => {

                application.http.response.send(pipe)

            }).catch(error => {

                console.log(error)
                application.http.response.send('Error')

            })

        else

            promise.then(pipe => {

                let {
                    body,
                    status,
                    headers
                } = pipe

                application.http.response.writeHead(status, headers)

                body.pipe(application.http.response)


            }).catch(error => {

                console.log(error)
                application.http.response.end('Error')

            })

    }
}

export default Server