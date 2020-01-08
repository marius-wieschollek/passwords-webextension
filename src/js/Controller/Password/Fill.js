import SearchIndex from '@js/Search/Index/SearchIndex';
import MessageService from '@js/Services/MessageService';
import SystemService from '@js/Services/SystemService';

export default class Fill {

    /**
     *
     * @param {Message} message
     * @param {Message} reply
     */
    async execute(message, reply) {
        let password = SearchIndex.getItem(message.getPayload());
        let tabs = await SystemService.getBrowserApi().tabs.query({currentWindow: true, active: true});

        MessageService.send(
            {
                type    : 'autofill.password',
                receiver: 'client',
                channel : 'tabs',
                tab     : tabs[0].id,
                payload : {
                    user    : password.getUserName(),
                    password: password.getPassword()
                }
            }
        );
    }
}