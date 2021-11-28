import Theme from '@js/Models/Theme/Theme';
import DarkTheme from '@js/Themes/Dark';
import LightTheme from '@js/Themes/Light';
import RGB from '@js/Themes/RGB';
import Hacker from '@js/Themes/Hacker';
import ArcDark from '@js/Themes/ArcDark';
import ArcLight from '@js/Themes/ArcLight';
import OledDarkTheme from '@js/Themes/OledDark';
import AdaptaTealTheme from '@js/Themes/AdaptaTeal';
import AdaptaLightTheme from '@js/Themes/AdaptaLight';
import SettingsService from '@js/Services/SettingsService';
import StorageService from '@js/Services/StorageService';
import { v4 as uuid } from 'uuid';
import BooleanState from 'passwords-client/boolean-state';
import ApiRepository from '@js/Repositories/ApiRepository';
import ServerThemeHelper from '@js/Helper/ServerThemeHelper';
import ErrorManager from '@js/Manager/ErrorManager';
import ServerManager from '@js/Manager/ServerManager';

class ThemeRepository {

    get STORAGE_KEY() {
        return 'themes';
    }

    constructor() {
        this._themes = null;
        this._customThemes = null;
        this._loading = new BooleanState(false);
        ServerManager.onAddServer.on(
            (server) => { this._addServer(server).catch(ErrorManager.catch); }
        );
        ServerManager.onRemoveServer.on(
            (server) => { this._removeServer(server).catch(ErrorManager.catch); }
        );
    }

    /**
     *
     * @param {Theme} theme
     */
    async create(theme) {
        if(theme.getId() === null || theme.getId() === undefined) {
            theme.setId(uuid());
        }

        await this._saveCustomTheme(theme);
        if(this._themes !== null) {
            this._themes[theme.getId()] = theme;
        }
    }

    /**
     *
     * @param {Theme} theme
     */
    async update(theme) {
        if(theme.getId() === null || theme.getId() === undefined) {
            return await this.create(theme);
        }

        await this._saveCustomTheme(theme);
        if(this._themes !== null) {
            this._themes[theme.getId()] = theme;
        }
    }

    /**
     *
     * @return {Promise<Theme[]>}
     */
    async findAll() {
        let themes = await this._listThemes();

        let list = [];
        for(let id in themes) {
            if(themes.hasOwnProperty(id)) list.push(themes[id]);
        }

        return list;
    }

    /**
     *
     * @return {Promise<Theme>}
     */
    async findById(id) {
        let themes = await this._listThemes();

        if(themes.hasOwnProperty(id)) return themes[id];

        // @TODO custom error here
        throw new Error('Unknown theme ' + id);
    }


    /**
     *
     * @return {Object}
     * @private
     */
    async _listThemes(force = false) {
        while(this._loading.get()) await this._loading.awaitFalse();
        if(this._themes !== null && !force) return this._themes;
        this._loading.set(true);

        let themes = {};
        let systemThemes = [LightTheme, DarkTheme, OledDarkTheme, AdaptaLightTheme, AdaptaTealTheme, ArcLight, ArcDark, Hacker, RGB];
        for(let data of systemThemes) {
            let theme = new Theme(data);

            themes[theme.getId()] = theme;
        }

        let serverThemes = await this.loadServerThemes();
        for(let theme of serverThemes) {
            themes[theme.getId()] = theme;
        }

        let customThemes = await this._loadCustomThemes();
        if(customThemes.length === 0) {
            themes.custom = await this._makeCustomTheme();
        } else {
            for(let theme of customThemes) {
                themes[theme.getId()] = theme;
            }
        }

        this._themes = themes;
        this._loading.set(false);

        return themes;
    }

    /**
     *
     * @return {Promise<Theme>}
     * @private
     */
    async _makeCustomTheme() {
        let theme = await SettingsService.getValue('theme.custom');

        if(theme === null || theme === undefined) {
            theme = LightTheme;
            theme.label = 'ThemeCustom';
        }

        theme.id = 'custom';

        return new Theme(theme);
    }

    /**
     *
     * @returns {Promise<Theme[]>}
     * @private
     */
    async _loadCustomThemes() {
        if(this._customThemes !== null) {
            return this._customThemes;
        }

        let themes = [];
        if(await StorageService.has(this.STORAGE_KEY)) {
            let data = await StorageService.get(this.STORAGE_KEY);

            for(let element of data) {
                themes.push(new Theme(element));
            }
        }

        this._customThemes = themes;
        return themes;
    }

    /**
     *
     * @return {Promise<[]>}
     */
    async loadServerThemes() {
        let themes   = [],
            promises = [],
            apis     = await ApiRepository.findAll();

        for(let api of apis) {
            if(api.getServer().getEnabled()) {
                promises.push(
                    ServerThemeHelper.create(api)
                        .then((theme) => themes.push(theme))
                        .catch(ErrorManager.catch)
                );
            }
        }

        await Promise.all(promises);

        return themes;
    }

    /**
     *
     * @param theme
     * @returns {Promise<void>}
     * @private
     */
    async _saveCustomTheme(theme) {
        let themes = await this._loadCustomThemes();

        for(let i = 0; i < themes.length; i++) {
            if(themes[i].getId() === theme.getId()) {
                themes[i] = theme;
                await this._saveCustomThemeList(themes);
                return;
            }
        }

        themes.push(theme);
        await this._saveCustomThemeList(themes);
    }

    /**
     *
     * @param {Theme[]} themes
     * @return {Promise<void>}
     * @private
     */
    async _saveCustomThemeList(themes) {
        let objects = [];

        for(let theme of themes) {
            objects.push(theme.getProperties());
        }
        await StorageService.set(this.STORAGE_KEY, objects);
    }

    /**
     *
     * @param {Server} server
     * @private
     */
    async _addServer(server) {
        let id = server.getId();
        if(this._themes === null || this._themes.hasOwnProperty(id)) return;
        let api = await ApiRepository.findById(id);

        let theme = await ServerThemeHelper.create(api);
        this._themes[theme.getId()] = theme;
    }

    /**
     *
     * @param {Server} server
     * @private
     */
    async _removeServer(server) {
        let id = server.getId();
        if(this._themes !== null && this._themes.hasOwnProperty(id)) {
            delete this._themes[id];
        }
    }
}

export default new ThemeRepository();