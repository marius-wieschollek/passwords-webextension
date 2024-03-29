<template>
    <div id="manager">
        <tabs :tabs="tabs" :initial-tab="tab" ref="tabs" v-on:switch="saveTab($event)" v-if="authorized">
            <related slot="related" v-on:search="searchEvent"/>
            <search slot="search"/>
            <browse slot="browse"/>
            <collected slot="collected" :initial-status="collected"/>
            <tools slot="tools"/>
        </tabs>
        <authorisation v-if="!authorized"></authorisation>
        <first-run-wizard v-if="firstRun" v-on:close="firstRun=false"/>
        <div id="toasts"></div>
    </div>
</template>

<script>
    import Tabs from '@vue/Components/Tabs';
    import Tools from '@vue/Components/Popup/Tools';
    import Browse from '@vue/Components/Popup/Browse';
    import Search from '@vue/Components/Popup/Search';
    import Related from '@vue/Components/Popup/Related';
    import Authorisation from '@vue/Components/Popup/Authorisation';
    import Collected from '@vue/Components/Popup/Collected';
    import PopupStateService from "@js/Services/PopupStateService";

    export default {
        el        : '#app',
        components: {
            Tools,
            Collected,
            Authorisation,
            Related,
            Search,
            Browse,
            Tabs,
            'first-run-wizard': () => import (/* webpackChunkName: "FirstRunWizard" */'@vue/Components/Firstrun/FirstRunWizard')
        },

        props: {
            collected: {
                type   : Object,
                default: () => {
                    return {
                        current: null
                    };
                }
            }
        },

        data() {
            PopupStateService.status.on((data) => {
                if(data.key === 'authorized') this.authorized = data.value;
            });

            return {
                authorized: PopupStateService.getStatus('authorized'),
                firstRun: PopupStateService.getStatus('firstRun')
            }
        },

        computed: {
            tab() {
                return PopupStateService.getTab();
            },
            tabs() {
                return {
                    related  : {
                        icon : 'key',
                        label: 'TabRelated'
                    },
                    search   : {
                        icon : 'search',
                        label: 'TabSearch'
                    },
                    browse   : {
                        icon : 'server',
                        label: 'TabBrowse'
                    },
                    collected: {
                        icon : 'history',
                        label: 'TabCollected'
                    },
                    tools    : {
                        icon : 'tools',
                        label: 'TabTools'
                    }
                };
            }
        },

        methods: {
            saveTab($event) {
                PopupStateService.setTab($event.tab);
            },
            searchEvent($event) {
                this.$refs.tabs.setActive('search');
                setTimeout(() => document.getElementById('query').value += $event, 10);
            }
        }
    };
</script>

<style lang="scss">
@import "@scss/includes";
@import "@scssP/browser.scss";

body {
    overflow : hidden;

    &.mobile {
        width  : 100vw;
        height : 100vh;
    }

    &.desktop {
        width  : 360px;
        height : 360px;
    }
}

#manager {
    width    : 100vw;
    height   : 100vh;
    display  : block;
    overflow : hidden;

    > .tab-container > .tabs .tab {
        overflow    : hidden;
        width       : calc(100vw - 12rem);
        transition  : var(--popup-tab-transition);
        box-sizing  : border-box;
        box-shadow  : var(--main-tab-border);
        flex-shrink : 0;

        .label {
            opacity    : 1;
            transition : var(--fade-transition);
        }

        &:not(.active) {
            width     : 3rem;
            flex-grow : 0;

            .label {
                opacity : 0;
            }
        }

        &.active {
            box-shadow : var(--main-tab-active-border);
        }
    }

    > .tab-container > .tab-content {
        max-height      : calc(100vh - 3rem - 2px);
        overflow        : auto;
        scrollbar-width : thin;
        scrollbar-color : var(--element-active-fg-color) var(--element-active-bg-color);
    }

    @media screen and (min-aspect-ratio : 13/9) {
        > .tab-container {
            display               : grid;
            grid-template-columns : 3rem 1fr;
            height                : 100vh;

            > .tabs {
                display      : block;
                border-right : 1px solid var(--element-hover-bg-color);

                > .tab {
                    &.active {
                        box-shadow : var(--main-tab-mobile-active-border);

                        .label {
                            opacity : 0;
                        }
                    }
                }
            }

            > .tab-content {
                max-height : 100vh;
            }
        }
    }
}
</style>
