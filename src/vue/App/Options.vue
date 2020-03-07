<template>
    <div id="options">
        <tabs :tabs="tabs">
            <accounts slot="accounts"/>
            <theming slot="theming" />
            <settings slot="other"/>
        </tabs>
        <div id="toasts"></div>
    </div>
</template>

<script>
    import Tabs from '@vue/Components/Tabs';
    import Theming from '@vue/Components/Options/Theming';
    import Accounts from '@vue/Components/Options/Accounts';
    import Settings from '@vue/Components/Options/Settings';

    export default {
        el        : '#app',
        components: {Theming, Tabs, Accounts, Settings},

        computed: {
            tabs() {
                return {
                    accounts: {
                        label: 'SettingsTabAccounts'
                    },
                    theming   : {
                        label: 'SettingsTabTheming'
                    },
                    other   : {
                        label: 'SettingsTabOther'
                    }
                };
            }
        }
    };
</script>

<style lang="scss">
    @import "@scss/includes";
    @import "@scssP/browser.scss";

    body {
        min-height : 600px;

        select,
        input[type=text] {
            background-color : var(--element-bg-color);
            color            : var(--element-fg-color);
            border           : 1px solid var(--element-hover-bg-color);
            border-radius    : 3px;
            font-weight      : normal;
            cursor           : text;
            padding          : 3px;
        }

        select {
            cursor : pointer;
        }

        input[type=button] {
            background-color : var(--element-hover-bg-color);
            color            : var(--element-hover-fg-color);
            border           : 1px solid var(--element-hover-bg-color);
            border-radius    : 3px;
            font-weight      : normal;
            cursor           : pointer;

            &:hover {
                background-color : var(--button-hover-bg-color);
                color            : var(--button-hover-fg-color);
                border           : 1px solid var(--button-hover-bg-color);
            }
        }

        &.mobile {
            input,
            select,
            button {
                line-height : 3rem;
                padding     : 0 1rem;
            }
        }
    }
</style>