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

    _addDebugBorders(fieldPairs) {
        for(let fieldPair of fieldPairs) {
            if(fieldPair.pass) fieldPair.pass.style.outline = '5px dashed #20bf6b';
            if(fieldPair.tel) fieldPair.tel.style.outline = '5px dashed #a55eea';
            if(fieldPair.email) fieldPair.email.style.outline = '5px dashed #0fb9b1';
            if(fieldPair.secondGuess) fieldPair.secondGuess.style.outline = '5px dashed #f7b731';
            if(fieldPair.firstGuess) fieldPair.firstGuess.style.outline = '5px dashed #fa8231';
            if(fieldPair.user) fieldPair.user.style.outline = '5px dashed #eb3b5a';
            if(fieldPair.submit) fieldPair.submit.style.outline = '5px dashed #3867d6';
            console.log(fieldPair);
        }
    }

    _addDebugHelp() {
        if(!document.getElementById('pw-form-highlight-help')) {
            let container = document.createElement('div');
            container.id = 'pw-form-highlight-help';
            container.setAttribute('style', 'position:fixed;left:10px;bottom:10px;font-size:15px;font-family:"Ubuntu Mono",Verdana,sans-serif;z-index:999999999999;color:#303952;');
            container.dataset.position = 'bottom-left';
            container.innerHTML =
                '<div style="background:#20bf6b;padding:.25em .5em">PASSWORD</div>' +
                '<div style="background:#eb3b5a;padding:.25em .5em">USERNAME</div>' +
                '<div style="background:#fa8231;padding:.25em .5em">USER GUESS #1</div>' +
                '<div style="background:#f7b731;padding:.25em .5em">USER GUESS #2</div>' +
                '<div style="background:#0fb9b1;padding:.25em .5em">EMAIL</div>' +
                '<div style="background:#a55eea;padding:.25em .5em">PHONE</div>' +
                '<div style="background:#3867d6;padding:.25em .5em">SUBMIT button</div>';

            container.addEventListener('click', () => {this._helpClickEvent();});

            let closeButton = document.createElement('button');
            closeButton.style.width = '100%';
            closeButton.innerText = 'close';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this._removeDebugUi();
            });
            container.appendChild(closeButton);

            document.body.appendChild(container);
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
        this._removeDebugBorders();
        let element = document.getElementById('pw-form-highlight-help');
        if(!element) return element;

        element.remove();
    }

    _removeDebugBorders() {
        let fieldPairs = new FormService().getLoginFields();
        for(let fieldPair of fieldPairs) {
            if(fieldPair.pass) fieldPair.pass.style.outline = '';
            if(fieldPair.tel) fieldPair.tel.style.outline = '';
            if(fieldPair.email) fieldPair.email.style.outline = '';
            if(fieldPair.secondGuess) fieldPair.secondGuess.style.outline = '';
            if(fieldPair.firstGuess) fieldPair.firstGuess.style.outline = '';
            if(fieldPair.user) fieldPair.user.style.outline = '';
            if(fieldPair.submit) fieldPair.submit.style.outline = '';
        }
    }
}