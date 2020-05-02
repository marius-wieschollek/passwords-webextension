<template>
    <div class="passlink-connect-codes">
        <div class="code-info">
            <translate say="PasslinkConnectCheckCodes"/>
        </div>
        <div v-for="code in codes" class="code-container">
            <span class="code">{{code}}</span>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import {PassLink} from 'passwords-client';
    import MessageService from '@js/Services/MessageService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import HttpError from 'passwords-client/src/Exception/Http/HttpError';
    import NetworkError from 'passwords-client/src/Exception/NetworkError';
    import LocalisationService from '@js/Services/LocalisationService';
    import SystemService from '@js/Services/SystemService';

    export default {
        components: {Translate},
        props     : {
            actionData: Object
        },

        data() {
            /** @type Connect */
            let action = PassLink.getAction('connect', this.actionData);
            action.getTheme().then((d) => {
                this.$emit('theme', d);
                this.theme = d;
            });
            let codes = action.getCodes();

            return {action, codes, theme: {}};
        },

        mounted() {
            this.attemptConnection();
        },

        methods: {
            async attemptConnection() {
                this.action.setClientLabel(await this.getUserAgent());
                this.action.apply()
                    .then((d) => { this.saveServer(d); })
                    .catch((d) => { this.error(d.message, d); });
            },
            async saveServer(data) {
                let payload = {
                    label  : this.getServerName(data),
                    baseUrl: this.actionData.baseUrl,
                    user   : data.login,
                    token  : data.token
                };

                try {
                    let message = await MessageService.send({type: 'server.create', payload});
                    if(message.getType() === 'server.item') {
                        this.success(payload.label);
                    } else {
                        this.error(message.getPayload().message);
                    }
                } catch(e) {
                    ErrorManager.logError(e);
                    this.error(e.message, e);
                }
            },
            async getUserAgent() {
                let bwInfo = await SystemService.getBrowserInfo(),
                    osInfo = await SystemService.getBrowserApi().runtime.getPlatformInfo(),
                    os     = osInfo.os ? `${osInfo.os[0].toUpperCase()}${osInfo.os.substr(1)}`:'';

                return LocalisationService.translate('UserAgent', [bwInfo.name, os]);
            },
            getServerName(data) {
                if(this.theme.hasOwnProperty('label')) {
                    return this.theme.label + ' - ' + data.login;
                }
                let host = new URL(this.actionData.baseUrl).host;
                return `${data.login}@${host}`;
            },
            error(message, error = null) {
                if(error instanceof HttpError && (error.status === 404 || error.status === 424)) {
                    message = error.status === 404 ? 'PasslinkConnectNotFound':'PasslinkConnectRejected';
                } else if(error instanceof NetworkError) {
                    message = 'PasslinkConnectNetworkError';
                }

                this.$emit('error', message);
            },
            success(label) {
                this.$emit('success', label);
            }
        }
    };
</script>

<style lang="scss">
    .passlink-connect-codes {
        .code-info {
            margin      : 1rem 1rem 2rem;
            font-weight : bold;
            text-align  : center;
        }

        .code-container {
            margin     : .5rem 0;
            text-align : center;

            .code {
                color            : var(--color-primary);
                background-color : var(--color-text);
                border           : 1px solid var(--color-primary);
                border-radius    : var(--border-radius-large);
                font-family      : var(--font-family-mono);
                text-align       : center;
                font-size        : 3rem;
                display          : inline-block;
                line-height      : 3rem;
                padding          : .5rem;
            }
        }
    }
</style>
