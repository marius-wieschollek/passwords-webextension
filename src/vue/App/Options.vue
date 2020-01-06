<template>
    <div id="options">
        <tabs :tabs="tabs">
            <accounts slot="accounts"/>
            <div slot="theme">
                theme
            </div>
            <div slot="other">
                other
            </div>
        </tabs>
    </div>
</template>

<script>
    import Tabs from '@vue/Components/Tabs';
    import Accounts from '@vue/Components/Options/Accounts';

    export default {
        el        : '#app',
        components: {Tabs, Accounts},

        computed: {
            tabs() {
                return {
                    accounts: {
                        label: 'SettingsTabAccounts'
                    },
                    theme   : {
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
    body {
        select,
        input[type=text] {
            background-color : var(--main-background-color);
            color            : var(--element-secondary-text-color);
            border           : 1px solid var(--element-secondary-border-color);
            border-radius    : 3px;
            font-weight      : normal;
            cursor           : text;
            padding          : 3px;

            &:hover {
                background-color : var(--main-background-color);
                color            : var(--element-secondary-hover-text-color);
                border           : 1px solid var(--element-secondary-hover-border-color);
            }
        }

        select {
            cursor : pointer;
        }

        input[type=button] {
            background-color : var(--element-secondary-background-color);
            color            : var(--element-secondary-text-color);
            border           : 1px solid var(--element-secondary-border-color);
            border-radius    : 3px;
            font-weight      : normal;
            cursor           : pointer;

            &:hover {
                background-color : var(--element-secondary-hover-background-color);
                color            : var(--element-secondary-hover-text-color);
                border           : 1px solid var(--element-secondary-hover-border-color);
            }
        }
    }
</style>