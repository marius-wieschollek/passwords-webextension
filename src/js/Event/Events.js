import EventEmitter from 'passwords-client/event-emitter';

const eventEmitter = new EventEmitter();

const subscribe = (event, callback) => {
    eventEmitter.on(event, callback);
};
const unsubscribe = (event, callback) => {
    eventEmitter.off(event, callback);
};
const once = (event, callback) => {
    eventEmitter.once(event, callback);
};
const emit = (event, data) => {
    eventEmitter.emit(event, data);
};

export {
    subscribe,
    unsubscribe,
    once,
    emit
};