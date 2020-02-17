import AbstractController from '@js/Controller/AbstractController';
import QueueService from '@js/Services/QueueService';
import MiningItem from '@js/Models/Queue/MiningItem';

export default class UpdateMiningItem extends AbstractController {

    async execute(message, reply) {
        let data        = message.getPayload(),
            miningQueue = QueueService.getFeedbackQueue('mining', null, MiningItem),
            items       = miningQueue.getItems();

        if(!data.hasOwnProperty('id') || !data.hasOwnProperty('result')) return;
        for(let item of items) {
            if(item.getId() === data.id) {
                item.setResult(data.result);
            }
        }
    }
}