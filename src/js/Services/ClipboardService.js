import ErrorManager from "@js/Manager/ErrorManager";

export default new class ClipboardService {

    /**
     *
     * @param {String} value
     */
    writeText(value) {
        navigator.clipboard.writeText(value)
                 .catch(ErrorManager.catch);
    }
}