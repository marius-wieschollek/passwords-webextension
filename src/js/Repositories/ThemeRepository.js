import Theme from '@js/Models/Theme/Theme';
import DarkTheme from '@js/Themes/Dark';
import LightTheme from '@js/Themes/Light';
import LocalisationService from '@js/Services/LocalisationService';

class ThemeRepository {

    constructor() {
        this._themes = null;
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
        throw new Error('Unknown theme');
    }


    /**
     *
     * @return {Object}
     * @private
     */
    async _listThemes() {
        if(this._themes !== null) return this._themes;

        this._themes = {};
        let systemThemes = [LightTheme, DarkTheme];
        for(let data of systemThemes) {
            let theme = this._makeSystemTheme(data);

            this._themes[theme.getId()] = theme;
        }

        return this._themes;
    }

    /**
     *
     * @param {Object} data
     * @return {Theme}
     * @private
     */
    _makeSystemTheme(data) {
        data.label = LocalisationService.translate(data.label);

        return new Theme(data);
    }
}

export default new ThemeRepository();