import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import QueueService from '@js/Services/QueueService';

class ErrorManager {

    get errors() {
        return this._errors;
    }

    get catchEvt() {
        return this.catch();
    }

    constructor() {
        this._errors = [];
        this._mode = 'client';
    }

    /**
     *
     * @param {String} [mode=client] The mode decides if errors are logged or sent to the backend
     */
    init(mode = 'client') {
        this._mode = mode;

        if(SystemService.getArea() !== 'client') {
            window.onerror = (message, file, line, col, error) => {
                this._addError(error, message, file, line, col);

                return false;
            };

            window.addEventListener('error', (e) => {
                this._addError(e.error, e.message, e.filename, e.lineno, e.colno);

                return false;
            });
        }

        if(mode === 'server') {
            this._addQueueConsumer();
        }
    }

    /**
     *
     * @param {Error} error
     * @param {Object} [context]
     */
    logError(error, context) {
        if(error instanceof Object && error.previousError instanceof Object) {
            this._addError(error.previousError);
        }

        this._addError(error, context);
    }

    /**
     * @returns {Function}
     */
    catch() {
        return (e) => { this.logError(e); };
    }

    /**
     *
     * @param {Error} error
     * @param {(String|Object)} [message]
     * @param {String} [file]
     * @param {Number} [line]
     * @param {Number} [col]
     * @private
     */
    _addError(error, message, file, line, col) {
        let details;
        if(error instanceof Error) {
            details = this._getDetailsFromError(error, message);
        } else if(typeof error === 'object' && error !== null) {
            details = this._getDetailsFromObject(error);
        } else {
            details = this._getErrorFromEvent(message, file, line, col);
        }

        let errorData   = this._convertErrorToObject(error),
            errorObject = {details, error: errorData};
        console.error(details.message, error, errorObject, details.stack);

        if(this._mode === 'server') {
            this._saveError(errorObject);
        } else {
            this._sendError(errorObject);
        }
    }

    /**
     *
     * @param {(Error|Object)} error
     * @returns {*}
     * @private
     */
    _convertErrorToObject(error) {
        if(error instanceof Error) {
            let data = {
                name        : error.name ? error.name:undefined,
                stack       : [],
                string      : error.toString()
            };
            if(error.stack) data.stack = error.stack.split("\n");
            let properties = Object.getOwnPropertyDescriptors(error);
            for(let property in properties) {
                if(properties.hasOwnProperty(property) && properties[property].hasOwnProperty('value')) {
                    data[property] = properties[property].value;
                }
            }

            return data;
        }

        return error;
    }

    /**
     *
     * @param {String} message
     * @param {String} file
     * @param {String} line
     * @param {Number} col
     * @return {{col: *, stack: string, file: *, line: *, message: *}}
     * @private
     */
    _getErrorFromEvent(message, file, line, col) {
        let error = new Error();

        return {
            message,
            file,
            line,
            col,
            stack: error.stack ? error.stack:''
        };
    }

    /**
     * @param {Object} data
     * @return {{stack: string, data: *}}
     * @private
     */
    _getDetailsFromObject(data) {
        let error = new Error();
        return {
            data,
            stack: error.stack ? error.stack:'',
            time : Date.now()
        };
    }

    /**
     *
     * @param {Error} error
     * @param {(Object|undefined)} context
     * @return {{stack: *, file: *, data: *, line: number, message: *}}
     * @private
     */
    _getDetailsFromError(error, context) {
        let data = context ? context:error;
        return {
            data   : data,
            message: error.message,
            file   : error.fileName,
            line   : error.lineNumber,
            stack  : error.stack ? error.stack:'',
            time   : Date.now()
        };
    }

    /**
     *
     * @param {{}} data
     * @private
     */
    _saveError(data) {
        this._errors.push(data);
    }

    /**
     *
     * @param {{}} data
     * @private
     */
    async _sendError(data) {
        try {
            await SystemService.waitReady();
            QueueService
                .getQueue('error', 'background')
                .push(data);
        } catch(e) {
            this.logError(e);
        }
    }

    /**
     *
     * @private
     */
    _addQueueConsumer() {
        SystemService
            .waitReady()
            .then(() => {
                MessageService.listen(
                    'queue.items',
                    (message) => {
                        return this._processQueueItems(message);
                    }
                );
            });
    }

    /**
     *
     * @param {Message} message
     * @private
     */
    _processQueueItems(message) {
        let payload = message.getPayload();
        if(payload && payload.name === 'error') {
            for(let item of payload.items) {
                this._saveError(item.task);
            }
        }
    }
}

export default new ErrorManager();