### IrisClient

The IrisClient is a websocket client that can subscribe to streams of live data from EOSIO based blockchains. It uses a channel/topic structure. Channels can be actions or rows and topics describe the specific actions that the IrisClient wants to receive streams for.

## Installation

`npm install @caleos/iris-client`

## Example

Currently the `connect` method is async and must be called and completed before subscriptions may be issued. The `eosmechanics` contract has a `cpu` action that is used to benchmark the Telos testnet BP node performance, this happens often enough to see actions regularly, this is an example of subscribing to that action and logging it's message:

```
(async () => {
    const IrisClient = require('@caleos/iris-client')
    let iris = new IrisClient('wss://testnet.telos.caleos.io/iris-head')
    await iris.connect()
    iris.subscribeAction('eosmechanics::cpu', (message) => console.log(JSON.stringify(message, null, 4)))
})()
```

For row based subscriptions you can watch for transfers of TLOS on the testnet:

```
(async () => {
    const IrisClient = require('@caleos/iris-client')
    let iris = new IrisClient('wss://testnet.telos.caleos.io/iris-head')
    await iris.connect()
    iris.subscribeRow('eosio.token', '*', 'accounts', (message) => console.log(JSON.stringify(message, null, 4)))
})()
```

The arguments to `subscribeRow` are (code, scope, table, callback) and `*` is only supported on the scope argument. In the above example the scope is the account who's balance of TLOS is in the row, so without using `*` we'd only see transfers for a single account that we'd have to specify ahead of time
