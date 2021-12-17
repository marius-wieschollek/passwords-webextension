<template>
    <div id="options">
        <tabs :tabs="tabs">
            <accounts slot="accounts"/>
            <theming slot="theming"/>
            <settings slot="other"/>
            <debug slot="debug"/>
        </tabs>
        <div id="toasts"></div>
    </div>
</template>

<script>
    import Tabs from '@vue/Components/Tabs';
    import Theming from '@vue/Components/Options/Theming';
    import Accounts from '@vue/Components/Options/Accounts';
    import Settings from '@vue/Components/Options/Settings';
    import Debug from "@vue/Components/Options/Debug";

    export default {
        el        : '#app',
        components: {Debug, Theming, Tabs, Accounts, Settings},

        computed: {
            tabs() {
                return {
                    accounts: {
                        icon : 'user',
                        label: 'SettingsTabAccounts'
                    },
                    theming : {
                        icon : 'palette',
                        label: 'SettingsTabTheming'
                    },
                    other   : {
                        icon : 'sliders-h',
                        label: 'SettingsTabOther'
                    },
                    debug   : {
                        icon : 'bug',
                        label: 'SettingsTabDebug'
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
    overflow : hidden;
    height : 400px;
    user-select : none;

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
.tab-content {
        overflow-y:scroll;
        height:100%;
        margin:0;
}

h4 {
    margin-bottom: 0.5rem;
}

</style>