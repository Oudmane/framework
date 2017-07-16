import {MongoClient, ObjectID} from 'mongodb'
import Entity from './MongoDB/Entity'

let database

class MongoDB {
    static configure(url, options) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, options, (error, db) => {
                if (error)
                    reject(error)
                else {
                    database = db
                    resolve(database)
                }
            })
        })
    }

    static get database() {
        return database
    }
}

MongoDB.Entity = Entity
MongoDB.ObjectID = ObjectID
MongoDB.IDRegex = /^[0-9a-fA-F]{24}$/

export default MongoDB