const WebSocket = require('isomorphic-ws')
const IrisClientSubscription = require('./IrisClientSubscription')
const Channels = require('./Channels')

class IrisClient {

constructor(endpoint) {
    this.endpoint = endpoint
        this.subscriptions = {}
        this.requests = {}
        this.rpcId = 0
    }

    async connect() {
        this.wsClient = new WebSocket(this.endpoint)

        await new Promise((resolve) => {
            this.wsClient.onopen = resolve
        })

        this.wsClient.onmessage = this.onMessage.bind(this)
        // TODO: Handle onclose and retry, keeping subscriptions around to resubscribe with
    }

    disconnect() {
        for (let subscription in this.subscriptions) {
            // TODO: unsubscribe
        }
        this.wsClient.close()
    }

    sendRPC(id, method, params, responseHandler) {
        this.wsClient.send(JSON.stringify(this.getRPC(id + "", method, params)))
        this.requests[id] = responseHandler
    }

    getRPC(id, method, params) {
        return {
            jsonrpc: '2.0',
            id,
            method,
            params
        }
    }

    handleIncoming(messageObj) {
        if (!messageObj.jsonrpc || messageObj.jsonrpc != '2.0') {
            console.error(`Recieved message that was not a JSON RPC 2.0 format: ${message}`)
            return
        }

        if (messageObj.id && this.requests.hasOwnProperty(messageObj.id)) {
            if (typeof this.requests[messageObj.id] === 'function') {
                console.log(`Recieved RPC response for id ${messageObj.id}`)
                this.requests[messageObj.id](messageObj)
                delete this.requests[messageObj.id]
            }
        }

        if (messageObj.method == 'subscription')
            this.handleSubscription(messageObj)
    }

    onMessage(message) {
        try {
            let messageObj = JSON.parse(message.data)
            if (Array.isArray(messageObj)) {
                messageObj.forEach((msg, idx) => {
                    this.handleIncoming(msg)
                })
            } else (
                this.handleIncoming(messageObj)
            )
        } catch (e) {
            console.error(`Failed parsing message as JSON: ${e}`)
        }
    }

    async handleSubscription(messageObj) {
        let params = messageObj.params;
        let channel = params.channel
        let topic = params.topic

        if (!this.subscriptions.hasOwnProperty(channel)) {
            console.error(`No registered subscriptions for channel ${channel}`)
            return
        }

        if (!this.subscriptions[channel].hasOwnProperty(topic)) {
            console.error(`No registered subscriptions for channel ${channel} with topic ${topic}`)
            return
        }

        this.subscriptions[channel][topic].handle(params.message)
    }

    subscribe(subscription) {
        if (!subscription.isValid()) {
            console.error(`Invalid subscription: ${JSON.stringify(subscription)}`)
            return
        }

        let channel = subscription.getChannel()
        let topic = subscription.getTopic()
        let alreadySubscribed = true
        if (!this.subscriptions.hasOwnProperty(channel)) {
            this.subscriptions[channel] = {}
            alreadySubscribed = false
        }

        if (!this.subscriptions[channel].hasOwnProperty(topic)) {
            this.subscriptions[channel][topic] = subscription
            alreadySubscribed = false
        }

        if (alreadySubscribed)
            throw new Error(`Already a subscription for channel ${channel} with topic ${topic}`)

        this.sendRPC(this.rpcId++, 'subscribe', subscription.toJSON(), (response) => {
            if (response.subscriptionId)
                subscription.responseReceived()
        })

        console.log(`Sent subscription request for channel ${channel} and topic ${topic}`)
    }

    subscribeAction(topic, handler) {
        if (!topic) {
            console.error('subscribeAction called without a topic')
            return
        }

        let clientSubscription = new IrisClientSubscription(Channels.ACTION, topic, handler)
        this.subscribe(clientSubscription)
        return clientSubscription
    }



}

module.exports = IrisClient