import http from 'http'
import https from 'https'
import {Server as Websocket} from 'ws'

/**
 * HTTP/S & WebSocket Server
 * @class
 */
class Server {
    /**
     * Create s Server
     * @param options - https Options
     */
    constructor(options = null) {
        // Initiate the HTTP/HTTPS Server
        /**
         * @name Server#server
         * @type http.Server
         */
        this.http = (options ? https : http).createServer(options)

        // Initiate the WebSocket Server
        /**
         * @name Server#websocket
         * @type Websocket
         */
        this.websocket = new Websocket({
            server: this.http
        })

        this.options = options || {}
    }

    /**
     * Start the Server - This will return the Promise when the server is started
     * @param {number|string} port - Port to listen to
     * @param {string} hostname - IP Address of the Interface to use
     * @returns {Promise}
     */
    start(port = 80, hostname = '0.0.0.0') {
        this.options.port = port
        this.options.hostname = hostname
        return new Promise((resolve, reject) => {
            this.http.listen(port, hostname, () => {
                resolve()
            })
        })
    }
}

export default Server