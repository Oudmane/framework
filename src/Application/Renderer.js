import {
    Readable
} from 'stream'
import path from 'path'
import fs from 'fs'

let templates

class Renderer {
    static render({body, status = 200, headers = {}, template = {}}, application) {
        return new Promise(resolve => {

            if (application.socket)
                resolve(body)

            else {

                let readable,
                    promise = Promise.resolve()

                promise = promise.then(
                    () => new Promise((resolve, reject) => {

                        if(!this.template)
                            resolve({body, status, headers})

                        else {

                            templates[template.name].render({body, status, headers, template}, application).then(resolve)

                        }

                    })
                )

                promise.then(({body, status, headers}) => {

                    if(typeof body.pipe === 'function')

                        readable = body

                    else {

                        readable = new Readable()

                        readable._read = function noop() {
                        }
                        readable.push(body)
                        readable.push(null)

                    }

                    resolve({
                        status: status || 200,
                        headers: {
                            ...this.headers,
                            ...headers
                        },
                        body: readable
                    })

                })

            }

        })
    }
    static loadTemplates(templatesDir) {
        return new Promise(resolve => {

            templates = {}

            fs.readdirSync(templatesDir).forEach(template => {

                let templateDir = path.join(templatesDir, template),
                    Template = {}

                if(fs.statSync(templateDir).isDirectory()) {

                    let templateFile = path.join(templateDir, 'index.js')

                    if(fs.existsSync(templateFile))
                        templates[template] = require(templateFile).default

                }

            })

            resolve(templates)

        })
    }
}

Renderer.headers = {}
Renderer.template = null

export default Renderer