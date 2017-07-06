import URL from 'url'
import qs from 'querystring'
import cookie from 'cookie'
import multipart from 'parse-multipart'

class Request {
    constructor(request, socket = false) {
        this.parseURL(request.url)
        this.method = request.method
        this.headers = request.headers
        this.cookies = {}
        if(this.headers.cookie)
            this.cookies = cookie.parse(this.headers.cookie)
        this.ip = this.headers['x-forwarded-for'] || request.connection.remoteAddress
        this.body = null
        this.bodyObject = {}
        this.files = []
        this.socket = socket
    }
    parseURL(url) {
        url = URL.parse(url, true)
        this.uri = url.path
        this.path = url.pathname
        this.query = url.search.replace(/^\?/, '')
        this.files = []
        this.pathArray = url.pathname.replace(/^\//, '').split('/')
        this.queryObject = url.query
    }
    parseBody(body, type = '') {
        this.body = body
        let typeArray = type.trim().split(';')
        switch(typeArray[0]) {
            case 'application/json':
            case 'json':
                this.bodyObject = JSON.parse(body)
                break
            case 'object':
                Object.assign(this.bodyObject, body)
                break
            case 'application/x-www-form-urlencoded':
            default:
                this.bodyObject = qs.parse(body)
                break
            case 'multipart/form-data':
                try {
                    let boundary = multipart.getBoundary(type)
                    this.files = multipart.Parse(Buffer.from(body, 'utf8'), boundary)
                } catch(e) {
                    this.files = []
                }
                break
        }
    }
    append(request) {
        this.method = request.method || 'GET'
        this.parseURL(request.url)
        this.parseBody(request.data || {}, 'object')
    }
    isInPath(component) {
        return this.pathArray.indexOf(component.toString()) !== -1
    }
    nextInPath(component) {
        let index
        if((index = this.pathArray.indexOf(component.toString())) !== -1)
            if(typeof this.pathArray[++index] !== 'undefined')
                return this.pathArray[index]
        return false
    }
    isInPOST(key) {
        return typeof this.bodyObject[key] !== 'undefined'
    }
    getPOST(key) {
        return this.isInPOST(key) ? this.bodyObject[key] : undefined
    }
    isInGET(key) {
        return typeof this.queryObject[key] !== 'undefined'
    }
    getGET(key) {
        return this.isInGET(key) ? this.queryObject[key] : undefined
    }
}

export default Request