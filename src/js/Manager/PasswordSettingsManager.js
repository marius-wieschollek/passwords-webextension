import SettingsService from '@js/Services/SettingsService';

export default new class PasswordSettingsManager {

    /**
     *
     */
    constructor() {
        this._showUsernameInList = null;
    }

    /**
     *
     */
    async init() {
        this._showUsernameInList = await SettingsService.get('password.list.show.user');
    }

    /**
     *
     */
    getShowUserInList() {
        return this._showUsernameInList.getValue();
    }
};
