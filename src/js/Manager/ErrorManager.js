import SystemService from '@js/Services/SystemService';
import MessageService from '@js/Services/MessageService';
import QueueService from '@js/Services/QueueService';

class ErrorManager {

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
     */
    logError(error, context) {
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
     * @param {String} [message]
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

        let errorObject = {details, error};
        console.error(details.message, errorObject, details.stack);

        if(this._mode === 'server') {
            this._saveError(errorObject);
        } else {
            this._sendError(errorObject);
        }
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
            stack: error.stack ? error.stack:''
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
            stack  : error.stack ? error.stack:''
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
        SystemService.waitReady()
            .then(() => {
                MessageService.listen(
                    'queue.items.error',
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
        this._saveError(payload);
    }
}

export default new ErrorManager();