# ipc-bridge-server
This is a library intended to be used as a wrapper around [Electron's](https://electronjs.org/) IPC Main. This is ment to be used in conjuction with [ipc-bridge-client](https://github.com/JeffreyRiggle/ipc-bridge-client) (render process).


## Installation
`$ install @jeffriggle/ipc-bridge-server`

## Usage

### Starting the Server
Once you are ready to start accepting messages you can turn the messaging on by using the start function.

```javascript
let {start} = require('@jeffriggle/ipc-bridge-server')

// Some required startup logic
start();
```

### Registering an event.
In order to allow the client to communicate you need to expose events that the client can communicate with you over. These are simple request response hookups.

```javascript
let {registerEvent} = require('@jeffriggle/ipc-bridge-server')

// Some required startup logic
registerEvent('customeventname', (event, data) => {
    // Logic to handle request
    // Event is the sender while data is whatever the client passed to you.
    // You can return any value here or no value. 
    // This will be given as the result for the client side promise
    return {};
});
```

### Broadcasting an event.
In some cases a client can *subscribe* to an event. In order to send a message to all clients that are listening for these events you can use a broadcast.

```javascript
let {broadcast} = require('@jeffriggle/ipc-bridge-server')

// The data to broadcast
let data = {};
broadcast('customeventname', data);
```

## Example
Some simple examples of this can be found at [ipc-bridge](https://github.com/JeffreyRiggle/ipc-bridge)

## License
 ipc-bridge-server is released under [MIT](./LICENSE)