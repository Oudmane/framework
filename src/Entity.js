const build = (object, properties) => {

        for (let key of Object.keys(properties))

            switch (properties[key].name || properties[key].constructor.name) {

                case 'Object':

                    build(object[key] = {}, properties[key])

                    break

                case 'Array':

                    object[key] = []

                    break

                default:

                    object[key] = new properties[key]

                    break

            }

    },
    bind = (object, values, types, trackChange = false, changes = new Set(), errors = {}, preKey) => {
        return Promise.all(
            Object.keys(values).map(key => new Promise((resolve, reject) => {

                // if the key exists in types
                if (typeof types[key] !== 'undefined')

                // if the type has a load function
                    if (typeof types[key].load === 'function')

                    // load it
                        types[key].load(values[key]).then(value => {

                            if (trackChange)

                                changes.add(`${preKey ? preKey + '.' : ''}${key}`)

                            object[key] = value

                            resolve()

                        }).catch(reject)

                    // no load function
                    else

                        switch (types[key].name || types[key].constructor.name) {

                            case 'Object':

                                bind(object[key], values[key], types[key], trackChange, changes, errors, `${preKey ? preKey + '.' : ''}${key}`).then(resolve).catch(reject)

                                break

                            case 'Array':

                                let [type] = types[key]

                                object[key] = []

                                Promise.all(
                                    (values[key] || []).map((value, i) => new Promise((resolve, reject) => {

                                        if (typeof type.load === 'function')

                                            type.load(value).then(loadedValue => {

                                                if (trackChange)

                                                    changes.add(`${preKey ? preKey + '.' : ''}${key}.${i}`)

                                                resolve(loadedValue)

                                            }).catch(reject)

                                        else if (type.constructor.name === 'Object') {

                                            let newValue = {}

                                            build(newValue, type)

                                            bind(newValue, value, type, trackChange, changes, errors, `${preKey ? preKey + '.' : ''}${key}.${i}`).then(() => {

                                                resolve(newValue)

                                            }).catch(reject)

                                        } else {

                                            if (trackChange)

                                                changes.add(`${preKey ? preKey + '.' : ''}${key}.${i}`)


                                            resolve(new type(value))

                                        }

                                    }))
                                ).then(values => {

                                    object[key] = values

                                    resolve()

                                }).catch(reject)

                                break

                            default:

                                try {

                                    object[key] = new types[key](values[key])

                                    if (trackChange)

                                        changes.add(`${preKey ? preKey + '.' : ''}${key}`)

                                    resolve()

                                } catch (error) {

                                    reject(error)

                                }

                                break

                        }

                else

                    resolve()
            }))
        )
    }


class Entity {

    constructor() {

        build(this, this.constructor.properties)

        let changes = new Set(),
            errors = {}

        this.getChanges = () => changes
        this.isChanged = (key) => key ? changes.has(key) : !!changes.size
        this.setChange = (key) => changes.add(key)

        this.getErrors = () => errors
        this.isErred = (key) => key ? errors.hasOwnProperty(key) : !!Object.keys(errors).length
        this.setError = (key, error) => errors[key] = error
        this.getError = (key) => errors[key]

        this.getBind = () => {
            return {
                changed: this.isChanged(),
                changes: this.getChanges(),
                erred: this.isErred(),
                errors: this.getErrors()
            }
        }

    }

    bind(data, change = true) {

        return bind(
            this,
            data,
            this.constructor.properties,
            change,
            this.getChanges(),
            this.getErrors()
        ).then(() => new Promise(resolve => {

            resolve(this.getBind())

        }))

    }

    save() {
        return Promise.resolve()
    }

    bindAndSave(data) {

        return this.bind(data).then(() => {
            return this.save()
        })

    }

    map(map) {

        let object = {}

        map.forEach(property => {

            switch (typeof property) {

                case 'string':

                    object[property] = this[property]

                    break

                case 'object':

                    let {
                            key,
                            map
                        } = property,
                        value = {}

                    map.split('.').forEach(key => {

                        value = value[key] || this[key]

                    })

                    object[key] = value

                    break
            }

        })


        return object

    }

}

Entity.properties = {}

export default Entity