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

        window.onerror = (message, file, line, col, error) => {
            this._addError(error, message, file, line, col);

            return false;
        };

        window.addEventListener('error', (e) => {
            this._addError(e.error, e.message, e.filename, e.lineno, e.colno);

            return false;
        });

        if(mode === 'server') {
            this._addQueueConsumer();
        }
    }

    /**
     *
     * @param {Error} error
     */
    logError(error) {
        this._addError(error);
    }

    /**
     * @returns {Function}
     */
    catch() {
        return (e) => { this.logError(e); }
    }

    /**
     *
     * @param {Error} error
     * @deprecated
     */
    logException(error) {
        this._addError(error);
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
        let details = {
            message: message ? message:error.message,
            file   : file ? file:error.fileName,
            line   : line ? line:error.lineNumber,
            col    : col ? col:'undefined'
        };

        let errorObject = {details, error};
        console.error(errorObject);

        if(this._mode === 'server') {
            this._saveError(errorObject);
        } else {
            this._sendError(errorObject);
        }
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
                .push(data)
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