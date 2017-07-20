import _Entity from '../Entity'
import MongoDB from  '../MongoDB'

const objectKeys = (object, columns) => {

    let sObject = {}

    if (typeof columns === 'undefined')
        columns = Object.keys(object.constructor.properties || object)

    for (let key of columns)

        if (object[key] === null)
            sObject[key] = object[key]

        else if (object[key].constructor.name === 'Object')
            sObject[key] = objectKeys(object[key])

        else if (object[key].constructor.name === 'Array')
            sObject[key] = object[key].map(element => {
                return element.valueOf()
            })

        else
            sObject[key] = object[key].valueOf()

    return sObject

}

class Entity extends _Entity {
    save() {

        if (this.id && !this.isChanged())
            return Promise.resolve()

        let isNew = !this.id.valueOf()

        return new Promise((resolve, reject) => {

            let columns = isNew ? Object.keys(this.constructor.properties) : this.getChanges(),
                id = columns.indexOf('id')

            if (id > -1)
                columns.splice(id, 1)

            columns.reduce((promise, key) => {

                if (typeof this[key].save === 'function')
                    return promise.then(() => new Promise(next => {
                        this[key].save().then(next)
                    }))

                else if (this[key].constructor.name === 'Array')
                    return promise.then(() => this[key].reduce((promise, property) => promise.then(() => new Promise(saved => {
                        if (typeof property.save === 'function')
                            property.save().then(() => {
                                saved()
                            })
                        else
                            saved()
                    })), Promise.resolve()))

                else
                    return promise

            }, Promise.resolve()).then(() => {
                let collection = MongoDB.database.collection(this.constructor.collection),
                    document = objectKeys(this, columns),
                    task = isNew ? collection.insertOne(document) : collection.updateOne({_id: new MongoDB.ObjectID(this.id.toString())}, {$set: document})
                task.then((result) => {
                    return new Promise(next => {
                        if (result.insertedId)
                            this.bind({id: result.insertedId}).then(next)
                        else
                            next()
                    })
                }).then(() => {

                    this.constructor.emit(isNew ? 'new' : 'edit', this)

                    this.constructor.emit('save', this, isNew)

                    resolve()
                })
            }).catch(reject)

        })
    }

    valueOf() {
        return new MongoDB.ObjectID(this.id.toString())
    }

    static load(query) {

        if (!query)
            return Promise.resolve(new this())

        if (query.constructor && query.constructor.name === this.name)
            return Promise.resolve(query)

        switch (typeof query) {
            case 'object':
                break
            default:
                if (MongoDB.ObjectID.isValid(query))
                    query = {_id: new MongoDB.ObjectID(query)}
                else
                    return Promise.resolve(new this())
                break
        }
        return new Promise((resolve, reject) => {
            MongoDB.database.collection(this.collection).findOne(query).then(document => {

                let entity = new this()

                if (document) {
                    document['id'] = document['_id']
                    delete document['_id']
                    entity.bind(document, false).then(() => {
                        resolve(entity)
                    })
                } else
                    resolve(entity)

            }).catch(reject)
        })
    }

    static loadAll(query = {}, options = {}) {
        return new Promise((resolve, reject) => {

            let cursor = MongoDB.database.collection(this.collection).find(query)

            if (options.order)
                cursor.sort(options.order)

            if (options.skip)
                cursor.skip(options.skip)

            if (options.limit)
                cursor.limit(options.limit)

            cursor.toArray().then(documents => {

                Promise.all(
                    documents.map(
                        entity => new Promise(resolve => {
                            let object = new this()
                            entity['id'] = entity['_id']
                            delete entity['_id']
                            object.bind(entity, false).then(() => {
                                resolve(object)
                            })
                        })
                    )
                ).then(resolve)

            }).catch(reject)
        })
    }
}

Entity.collection = ''

export default Entity