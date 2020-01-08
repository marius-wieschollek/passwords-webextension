import ErrorManager from '@js/Manager/ErrorManager';
import SearchManager from '@js/Manager/SearchManager';
import ServerManager from '@js/Manager/ServerManager';
import SystemService from '@js/Services/SystemService';
import UpgradeManager from '@js/Manager/UpgradeManager';
import ConverterManager from '@js/Manager/ConverterManager';
import ControllerManager from '@js/Manager/ControllerManager';
import RecommendationManager from '@js/Manager/RecommendationManager';
import MessageService from '@js/Services/MessageService';

class Background {
    async init() {
        SystemService.setArea('background');
        ErrorManager.init('server');
        try {
            await SystemService.waitReady();
            await UpgradeManager.run();
            MessageService.init();
            ControllerManager.init();
            ConverterManager.init();
            SearchManager.init();
            await ServerManager.init();
            RecommendationManager.init();
        } catch(e) {
            ErrorManager.logError(e);
        }
    }
}

export default new Background();