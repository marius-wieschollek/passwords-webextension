import Password from 'passwords-client/src/Model/Password/Password';
import Folder from 'passwords-client/src/Model/Folder/Folder';

export default class FolderConverter {

    /**
     *
     * @param {Message} message
     * @returns {Message}
     */
    convert(message) {
        if(message.getType() === 'folder.items') {
            this._processFolderItems(message);
        }

        return message;
    }

    /**
     *
     * @param {Message} message
     */
    _processFolderItems(message) {
        let payload = message.getPayload();
        payload.folders = this._convertFolders(payload.folders);
        message.setPayload(payload);
    }

    /**
     *
     * @param {Array} items
     * @return {Password[]}
     * @private
     */
    _convertFolders(items) {
        let folders = [];

        if(items !== null) {
            for(let data of items) {
                folders.push(new Folder(data));
            }
        }

        return folders;
    }
}