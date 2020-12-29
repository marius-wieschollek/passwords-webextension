import Options from '@js/App/Options';
import '@js/Prototype/prototype';

// noinspection JSUnresolvedVariable
__webpack_public_path__ = `/`;

Options.init()
    .catch(console.error);
