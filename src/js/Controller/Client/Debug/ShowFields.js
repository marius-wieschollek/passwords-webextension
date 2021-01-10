import FormService from '@js/Services/FormService';
import AbstractController from '@js/Controller/AbstractController';

export default class ShowFields extends AbstractController {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        this._addDebugUi();
    }

    _addDebugUi() {
        let forms = new FormService().getLoginFields();
        this._addDebugBorders(forms);
        this._addDebugHelp(forms);
    }

    /**
     * @param {Object[]} fieldPairs
     * @private
     */
    _addDebugBorders(fieldPairs) {
        for(let fieldPair of fieldPairs) {
            if(fieldPair.form) this._addDebugFieldDummy(fieldPair.form, '#54a0ff', 'LOGIN FORM');
            if(fieldPair.pass) this._addDebugFieldDummy(fieldPair.pass, '#20bf6b', 'PASSWORD');
            if(fieldPair.tel) this._addDebugFieldDummy(fieldPair.pass, '#a55eea', 'PHONE');
            if(fieldPair.email) this._addDebugFieldDummy(fieldPair.email, '#0fb9b1', 'EMAIL');
            if(fieldPair.secondGuess) this._addDebugFieldDummy(fieldPair.secondGuess, '#f7b731', 'SECOND GUESS');
            if(fieldPair.firstGuess) this._addDebugFieldDummy(fieldPair.firstGuess, '#fa8231', 'FIRST GUESS');
            if(fieldPair.user) this._addDebugFieldDummy(fieldPair.user, '#eb3b5a', 'USER');
            if(fieldPair.submit) this._addDebugFieldDummy(fieldPair.submit, '#3867d6', 'SUBMIT');
            if(fieldPair.remember) this._addDebugFieldDummy(fieldPair.remember, '#6c5ce7', 'REMEMBER');
            console.log(fieldPair);
        }
    }

    /**
     * @param {Object[]} forms
     * @private
     */
    _addDebugHelp(forms) {
        if(!document.getElementById('pw-form-highlight-help')) {
            let container = document.createElement('div');
            container.id = 'pw-form-highlight-help';
            container.setAttribute('style',
                                   'position:fixed;left:10px;bottom:10px;font-size:15px;font-family:"Ubuntu Mono",Verdana,sans-serif;z-index:999999999999;color:#303952;background-color:#fff');
            container.dataset.position = 'bottom-left';
            container.innerHTML =
                '<div style="background:#20bf6b;padding:.25em .5em">PASSWORD</div>' +
                '<div style="background:#eb3b5a;padding:.25em .5em">USERNAME</div>' +
                '<div style="background:#fa8231;padding:.25em .5em">USER GUESS #1</div>' +
                '<div style="background:#f7b731;padding:.25em .5em">USER GUESS #2</div>' +
                '<div style="background:#0fb9b1;padding:.25em .5em">EMAIL</div>' +
                '<div style="background:#a55eea;padding:.25em .5em">PHONE</div>' +
                '<div style="background:#6c5ce7;padding:.25em .5em">REMEMBER</div>' +
                '<div style="background:#54a0ff;padding:.25em .5em">LOGIN FORM</div>' +
                '<div style="background:#3867d6;padding:.25em .5em">SUBMIT button</div>' +
                '<div style="padding:.25em .5em" id="pw-form-highlight-help-forms">FOUND ' + forms.length + ' FORMS</div>';

            container.addEventListener('click', () => {this._helpClickEvent();});

            let closeButton = document.createElement('button');
            closeButton.style.width = '100%';
            closeButton.style.padding = '.25em .5em';
            closeButton.innerText = 'close';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this._removeDebugUi();
            });
            container.appendChild(closeButton);

            document.body.appendChild(container);
        } else {
            let counter = document.getElementById('pw-form-highlight-help-forms');
            counter.innerText = `FOUND ${forms.length} FORMS`;
        }
    }

    _helpClickEvent() {
        let element = document.getElementById('pw-form-highlight-help');
        if(!element) return element;

        if(element.dataset.position === 'bottom-left') {
            element.style.left = 'auto';
            element.style.right = '10px';
            element.dataset.position = 'bottom-right';
        } else if(element.dataset.position === 'bottom-right') {
            element.style.bottom = 'auto';
            element.style.top = '10px';
            element.dataset.position = 'top-right';
        } else if(element.dataset.position === 'top-right') {
            element.style.right = 'auto';
            element.style.left = '10px';
            element.dataset.position = 'top-left';
        } else if(element.dataset.position === 'top-left') {
            element.style.bottom = '10px';
            element.style.top = 'auto';
            element.dataset.position = 'bottom-left';
        }
    }

    _removeDebugUi() {
        let elements = document.getElementById('pw-form-highlight-elements');
        if(elements) elements.remove();

        let help = document.getElementById('pw-form-highlight-help');
        if(help) help.remove();
    }

    /**
     *
     * @param {HTMLElement} element
     * @param {string} color
     * @param {string} title
     * @private
     */
    _addDebugFieldDummy(element, color, title) {
        let position = this._getAbsolutePosition(element),
            div      = document.createElement('div'),
            width    = element.offsetWidth < 24 ? 24:element.offsetWidth,
            height   = element.offsetHeight < 24 ? 24:element.offsetHeight,
            cursor   = 'text';

        if(element.nodeName === 'BUTTON' || element.type && ['checkbox', 'submit', 'button', 'radio'].indexOf(element.type) !== -1) {
            cursor = 'pointer';
        }

        div.setAttribute('style',
                         `position:absolute !important;top:${position.top}px !important;left:${position.left}px !important;width:${width}px !important;height:${height}px !important;z-index:999999999 !important;outline:5px dashed ${color} !important;background-color:transparent !important;cursor:${cursor} !important;`);
        div.setAttribute('title', title);

        if(element.nodeName === 'INPUT' && (!element.type || (element.type !== 'button' && element.type !== 'submit'))) {
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                element.focus();
            });
        } else if(element.nodeName === 'BUTTON' || element.nodeName === 'INPUT' && element.type && (element.type === 'button' || element.type === 'submit')) {
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                element.click();
            });
        }

        this._getDummyFieldContainer().appendChild(div);
    }

    /**
     * @param element
     * @return {{top: number, left: number}}
     * @private
     */
    _getAbsolutePosition(element) {
        let left = 0,
            top  = 0;

        if(element.offsetParent === null && element.parentNode && element.parentNode.offsetParent !== null) {
            element = element.parentNode;
        }

        while(element.offsetParent) {
            left += element.offsetLeft;
            top += element.offsetTop;
            element = element.offsetParent;
        }

        return {left, top};
    }

    /**
     *
     * @return {HTMLElement}
     * @private
     */
    _getDummyFieldContainer() {
        if(document.getElementById('pw-form-highlight-elements')) {
            return document.getElementById('pw-form-highlight-elements');
        } else {
            let container = document.createElement('div');
            container.id = 'pw-form-highlight-elements';
            document.body.appendChild(container);
            return container;
        }
    }
}