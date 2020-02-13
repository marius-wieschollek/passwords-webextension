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
        if(message.getType() === 'folder.item') {
            this._convertFolderItem(message);
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
     * @param {Message} message
     */
    _convertFolderItem(message) {
        let payload = message.getPayload();

        if(payload === null) return;
        message.setPayload(new Folder(payload));
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
                if(data !== null)  folders.push(new Folder(data));
            }
        }

        return folders;
    }
}