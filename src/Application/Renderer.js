import {Readable} from 'stream'

class Renderer {
    static render({body, status = 200, headers = {}}, socket = false) {
        return new Promise((resolve, reject) => {

            if(socket)
                resolve(body)

            else {

                let readable = new Readable()

                readable._read = function noop() {
                }
                readable.push(body)
                readable.push(null)

                resolve({
                    status: status || 200,
                    headers: {
                        ...this.headers,
                        ...headers
                    },
                    body: readable
                })
            }
        })
    }
}

Renderer.headers = {}

export default Renderer