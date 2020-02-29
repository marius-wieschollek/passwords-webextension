import Preview from '@js/App/Preview';
import '@js/Prototype/prototype';
import '@scss/preview.scss'

// noinspection JSUnresolvedVariable
__webpack_public_path__ = `/`;

Preview.init()
    .catch(console.error);