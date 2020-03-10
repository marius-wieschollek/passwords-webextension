import EventQueue from '@js/Event/EventQueue';
import ErrorManager from '@js/Manager/ErrorManager';

export default class Setting {

    set name(value) {
        this._name = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        let oldValue = this._value;
        this._value = value;

        if(oldValue === value) return;
        this._change.emit({value: value, name: this._name, oldValue})
            .catch(ErrorManager.catch);
    }

    get change() {
        return this._change;
    }

    constructor(name, value) {
        this._name = name;
        this._value = value;
        this._change = new EventQueue();
    }

    getName() {
        return this._name;
    }

    getValue() {
        return this._value;
    }

    setValue(value) {
        this.value = value;

        return this;
    }
}