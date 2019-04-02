const {ipcMain} = require('electron');

let events = new Map();
let subscriptions = new Map();

const start = () => {
    ipcMain.on('subscribe', (event, id) => {
        if (!subscriptions.get(id)) {
            subscriptions.set(id, [event.sender]);
        }
        else {
            subscriptions.get(id).push(event.sender);
        }

        let evt = events.get(id);
        if (evt) {
            evt(event.sender);
        }
    });

    ipcMain.on('unsubscribe', (event, id) => {
        if (!subscriptions.get(id)) {
            return;
        }

        let ind = subscriptions.get(id).indexOf(event.sender);
        if (ind !== -1) {
            subscriptions.get(id).splice(ind, 1);
        }
    });

    ipcMain.on('request', (event, message) => {
        let evt = events.get(message.id);

        if (!evt) {
            return;
        }

        let data = evt(event, message.data);
        if ((data || data === false) && message.correlationId) {
            event.sender.send(`cid${message.correlationId}`, data);
        }
    })
}

const registerEvent = (eventId, func) => {
    events.set(eventId, func);
}

const unRegisterEvent = (eventId) => {
    events.delete(eventId);
}

const broadcast = (eventId, message) => {
    let listeners = subscriptions.get(eventId);

    if (!listeners) {
        return;
    }

    listeners.forEach(listener => {
        listener.send(eventId, message);
    });
}

module.exports = {
    start,
    registerEvent,
    unRegisterEvent,
    broadcast
}