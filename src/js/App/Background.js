import ErrorManager from '@js/Manager/ErrorManager';
import SearchManager from '@js/Manager/SearchManager';
import ServerManager from '@js/Manager/ServerManager';
import SystemService from '@js/Services/SystemService';
import UpgradeManager from '@js/Manager/UpgradeManager';
import ConverterManager from '@js/Manager/ConverterManager';
import ControllerManager from '@js/Manager/ControllerManager';
import RecommendationManager from '@js/Manager/RecommendationManager';
import MessageService from '@js/Services/MessageService';
import AutofillManager from '@js/Manager/AutofillManager';
import TabManager from '@js/Manager/TabManager';
import BadgeManager from '@js/Manager/BadgeManager';
import ContextMenuManager from '@js/Manager/ContextMenuManager';
import MiningManager from '@js/Manager/MiningManager';
import NotificationService from '@js/Services/NotificationService';
import ThemeService from '@js/Services/ThemeService';
import ThemeRepository from '@js/Repositories/ThemeRepository';
import SettingsService from '@js/Services/SettingsService';
import MasterSettingsProvider from '@js/Settings/MasterSettingsProvider';
import LocalisationService from "@js/Services/LocalisationService";
import PasswordStatisticsService from "@js/Services/PasswordStatisticsService";
import PassLinkManager from "@js/Manager/PassLinkManager";
import BasicAuthAutofillManager from "@js/Manager/BasicAuthAutofillManager";
import ServerTimeoutManager from "@js/Manager/ServerTimeoutManager";
import StorageService from "@js/Services/StorageService";

class Background {
    async init() {
        SystemService.setArea('background');
        ErrorManager.init('server');
        try {
            await SystemService.waitReady();
            await MessageService.init();
            await StorageService.init();
            SettingsService.init(MasterSettingsProvider);
            await UpgradeManager.run();
            PassLinkManager.init();
            ControllerManager.init();
            ConverterManager.init();
            SearchManager.init();
            TabManager.init();
            NotificationService.init();
            RecommendationManager.init();
            await AutofillManager.init();
            ThemeService.init(ThemeRepository);
            BadgeManager.init();
            ContextMenuManager.init();
            MiningManager.init();
            ServerTimeoutManager.init();
            await PasswordStatisticsService.init();
            await ServerManager.init();
            await BasicAuthAutofillManager.init();
            await LocalisationService.init();
        } catch(e) {
            ErrorManager.logError(e);
            ErrorManager.error('Extension initialization failed. Extension may not work properly.');
        }
    }
}

export default new Background();