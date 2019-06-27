const crypto = require('isomorphic-webcrypto')

class IrisClientSubscription {

    constructor(channel, topic, handler, id) {
        this.channel = channel
        this.topic = topic
        this.handler = handler
        this.id = id ? id : this.createId()
        this.gotResponse = false
    }

    static actionSubscription(contract, action, handler) {
        return new IrisClientSubscription(Channels.ACTION, `${contract}::${action}`, handler)
    }

    static transferSubscription(account, handler) {
        return new IrisClientSubscription(Channels.TRANSFER, account, handler)
    }

    createId() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    responseReceived() {
        this.gotResponse = true
    }

    setHandler(handler) {
        this.handler = handler
    }

    getChannel() {
        return this.channel
    }

    getTopic() {
        return this.topic
    }

    handle(message) {
        this.handler(message)
    }

    getId() {
        return this.id
    }

    static fromObj(obj) {
        if (typeof obj === 'string')
            obj = JSON.parse(obj)

        return new IrisClientSubscription(obj.channel, obj.topic, obj.handler, obj.id)
    }

    isValid() {
        return this.channel && this.topic && this.id
    }

    toJSON() {
        return JSON.stringify({
            channel: this.channel,
            topic: this.topic,
            id: this.id
        })
    }

}

module.exports = IrisClientSubscription