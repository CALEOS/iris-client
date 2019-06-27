### IrisClient

The IrisClient is a websocket client that can subscribe to streams of live data from EOSIO based blockchains. It uses a channel/topic structure. Channels can be actions or rows and topics describe the specific actions that the IrisClient wants to receive streams for.

## Installation

Clone this repo and `require('iris-client')`

## Example

Currently the `connect` method is async and must be called and completed before subscriptions may be issued. The `eosmechanics` contract has a `cpu` action that is used to benchmark the Telos testnet BP node performance, this happens often enough to see actions regularly, this is an example of subscribing to that action and logging it's message:

```
(async () => {
    const IrisClient = require('./IrisClient')
    let iris = new IrisClient('wss://testnet.telos.caleos.io/iris-head')
    await iris.connect()
    iris.subscribeAction('eosmechanics::cpu', (message) => console.log(JSON.stringify(message, null, 4)))
})()
```
