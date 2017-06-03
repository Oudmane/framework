
const trigger = (event, params) => {
    return Promise.all(
        Application[event].map(e => new Promise(
            (resolve, reject) => {
                Promise.resolve(e(...params)).then(resolve).catch((error) => {
                    error.chaine.unshift(event)
                    reject(error)
                })
            }
        ))
    )
}

class Application {
    constructor() {

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

    }
}

Application.beforeInitiate = []
Application.initiate = []
Application.afterInitiate = []

Application.routes = []

export default Application