import {
    CronJob as Job
} from 'cron'
import EventEmitter from 'events'

let jobs = {},
    events = new EventEmitter()

class CronJob {
    static start(id, cronTime, task, data, timeZone = 'Universal') {
        jobs[id] = new Job({
            cronTime,
            timeZone,
            onTick: () => {
                this.emit(task, data, id)
                this.emit('tick', id)
            },
            onComplete: () => {
                this.emit('complete', id)
            }
        })
        jobs[id].start()
        this.emit('init', id)
    }
    static stop(id) {
        if(jobs[id]) {
            jobs[id].stop()
            delete jobs[id]
        }
    }
    static on() {
        events.on.apply(this, arguments)
    }
    static once() {
        events.once.apply(this, arguments)
    }
    static emit() {
        events.emit.apply(this, arguments)
    }
}

export default CronJob