import Vue from 'vue';
import ErrorManager from '@js/Manager/ErrorManager';
import Popup from '@js/App/Popup';

class Preview {

    /**
     *
     * @return {(Vue|null)}
     */
    get app() {
        return this._popup.app;
    }

    constructor() {
        this._popup = Popup;
    }

    async init() {
        await this._popup.init();
        this._initVue().catch(ErrorManager.catch);
    }

    async _initVue() {
        let container = document.createElement('div');
        container.id = 'demo';
        document.body.appendChild(container);

        let Menu          = await import(/* webpackChunkName: "DemoMenu" */ '@vue/Components/Demo/DemoMenu'),
            MenuContainer = Vue.extend(Menu.default);

        new MenuContainer({el: '#demo'});
    }
}

export default new Preview();