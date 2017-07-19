import Server from './Application/Server'
import Renderer from './Application/Renderer'
import fs from 'fs'
import path from 'path'
import http from 'http'

const trigger = (event, params) => {
        return Promise.all(
            Application.triggers[event].map(e => new Promise(
                (resolve, reject) => {
                    Promise.resolve(e(...params)).then(resolve).catch((error) => {
                        reject(error)
                    })
                }
            ))
        )
    },
    loadRoutesAndTriggers = (Component, component, task) => {
        routes.forEach(trigger => {
            if (Component[task][trigger])
                if (Array.isArray(Component[task][trigger]))
                    Component[task][trigger].forEach(route => {
                        Application.routes.push({
                            component,
                            task,
                            ...route
                        })
                    })
                else
                    Application.routes.push({
                        component,
                        task,
                        ...Component[task][trigger]
                    })
        })
        triggers.forEach(trigger => {
            if (Component[task][trigger])
                if (Array.isArray(Component[task][trigger]))
                    Component[task][trigger].forEach(callback => {
                        Application.triggers[trigger].push(callback)
                    })
                else
                    Application.triggers[trigger].push(Component[task][trigger])
        })
    },
    triggers = [
        'beforeInitiate',
        'initiate',
        'afterInitiate',
        'beforeLoad',
        'afterLoad'
    ],
    routes = [
        'route',
        'routes'
    ]

let components = null,
    modules = null

/**
 * @class Application
 */
class Application {
    constructor() {

        /**
         * @name Application#http
         * @type {{request: http.ClientRequest, response: http.ServerResponse}}
         */
        this.http = {
            /**
             * @type {http.ClientRequest}
             * @name Application#http#request
             */
            request: null,
            /**
             * @type {http.ServerResponse}
             * @name Application#http#request
             */
            response: null
        }

        this.socket = false

    }

    initiate(authorization) {
        return new Promise((resolve, reject) => {
            trigger('beforeInitiate', [authorization, this]).then(
                () => trigger('initiate', [authorization, this])
            ).then(
                () => trigger('afterInitiate', [authorization, this])
            ).then(resolve).catch(reject)
        })
    }

    route(request = {}) {
        return new Promise((resolve, reject) => {

            if (Application.routes.length)
                Promise.race(Application.routes.map(route => new Promise((resolve, reject) => {
                    Promise.resolve(route.uri.test(request.path)).then(isRouted => {
                        if (isRouted)
                            resolve({
                                request,
                                ...route
                            })
                    })

                }))).then(resolve).catch(reject)

            else
                reject('No routes')

        })
    }

    load(route) {
        return new Promise((resolve, reject) => {

            let {
                    component,
                    task
                } = route,
                _payload = {}

            trigger('beforeLoad', [this, route, _payload]).then(
                () => {

                    return new Promise((resolve, reject) => {

                        if (!components)
                            reject('Components unloaded')

                        else if (!components[component])
                            reject('Component not found')

                        else if (!components[component][task])
                            reject('task not found')

                        else
                            components[component][task].run(this, route, _payload).then(payload => {

                                resolve(_payload = Object.assign(_payload, payload))

                            }).catch(reject)

                    })
                }
            ).then(
                payload => trigger('afterLoad', [this, route, _payload])
            ).then(() => {

                resolve(_payload)

            }).catch(reject)

        })
    }

    render(payload) {
        return this.constructor.Renderer.render(payload, this)
    }

    static loadComponents(componentsDir) {
        return new Promise(resolve => {
            components = {}
            fs.readdirSync(componentsDir).forEach(component => {
                let componentDir = path.join(componentsDir, component),
                    Component = {}
                if (fs.statSync(componentDir).isDirectory()) {
                    let controllerFile = path.join(componentDir, 'controller.js'),
                        tasksDir = path.join(componentDir, 'tasks')
                    if (fs.existsSync(controllerFile)) {
                        Component.default = require(controllerFile).default
                        loadRoutesAndTriggers(Component, component, 'default')

                    }
                    if (fs.existsSync(tasksDir))
                        fs.readdirSync(tasksDir).forEach(task => {
                            let taskDir = path.join(tasksDir, task)
                            if (fs.statSync(componentDir).isDirectory()) {
                                let taskFile = path.join(taskDir, 'controller.js')
                                if (fs.existsSync(taskFile)) {
                                    Component[task] = require(taskFile).default
                                    loadRoutesAndTriggers(Component, component, task)
                                }
                            }
                        })
                    components[component] = Component
                }
            })

            resolve(components)
        })
    }
}

Application.routes = []
Application.triggers = {}

triggers.forEach(trigger => {
    Application.triggers[trigger] = []
})

Application.Server = Server
Application.Renderer = Renderer

export default Application