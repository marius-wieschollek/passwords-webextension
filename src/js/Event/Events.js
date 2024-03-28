import EventEmitter from 'passwords-client/event-emitter';
import ErrorManager from "@js/Manager/ErrorManager";

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
    eventEmitter.emit(event, data)
        .catch(ErrorManager.catch);
};
const emitAsync = async (event, data) => {
    await eventEmitter.emit(event, data);
};

export {
    subscribe,
    unsubscribe,
    once,
    emit,
    emitAsync
};