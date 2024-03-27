<template>
    <div class="server-setup-wizard">
        <translate tag="h2" say="FirstRunConnectTitle"/>
        <ol class="sever-setup-options">
            <translate tag="li" say="FirstRunConnectLink1"/>
            <translate tag="li" say="FirstRunConnectLink2"/>
            <translate tag="li" say="FirstRunConnectLink3"/>
        </ol>
        <button-field value="FirstRunSetupVideo" @click="openWiki"/>
        <div class="setup-other-options">
            <translate class="link" say="FirstRunSetupManually" @click="openSettings"/>
            <span class="separator"> </span>
            <translate class="link" say="FirstRunConnectScanQR" @click="scanQr"/>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import ButtonField from '@vue/Components/Form/ButtonField';
    import MessageService from '@js/Services/MessageService';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {ButtonField, Translate},

        methods: {
            scanQr() {
                MessageService.send({type: 'passlink.open', payload: {action: 'scan-qr'}})
                              .catch(ErrorManager.catch);
                window.close();
            },
            openSettings() {
                MessageService.send('popup.settings.open')
                              .catch(ErrorManager.catch);
            },
            openWiki() {
                MessageService.send('firstrun.guide')
                              .catch(ErrorManager.catch);
            }
        }
    };
</script>

<style lang="scss">
.server-setup-wizard {
    display        : flex;
    flex-direction : column;
    height         : 100%;

    h2 {
        text-align : center;
    }

    .sever-setup-options {
        padding   : 0 2rem;
        margin    : 0 0 1.25rem !important;
        flex-grow : 1;

        li {
            margin-bottom : 1rem;
        }
    }

    button {
        background-color : var(--element-active-bg-color);
        color            : var(--element-active-fg-color);
        text-align       : center;
        width            : 100%;
        line-height      : 3rem;
        border-radius    : var(--button-border-radius);
        border           : none;
        cursor           : pointer;

        &:hover {
            background-color : var(--element-active-hover-bg-color);
            color            : var(--element-active-hover-fg-color);
        }
    }

    .setup-other-options {
        text-align : center;
        padding    : .5rem 0;

        .separator {
            padding : 0 .5rem;
        }

        .link {
            cursor : pointer;

            &:hover {
                text-decoration : underline;
            }
        }
    }
}

body.mobile {
    .server-setup-wizard {
        font-size   : 1.4rem;
        line-height : 1.8rem;

        .sever-setup-options {
            padding-left : 1.5rem;
        }

        button {
            font-size   : 1.5rem;
            line-height : 4rem;
            width       : calc(100% - 2rem);
        }
    }
}
</style>