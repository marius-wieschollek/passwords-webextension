<template>
    <div id="manager">
        <tabs :tabs="tabs" :initial-tab="tab" ref="tabs" v-on:switch="saveTab($event)" v-if="authorized">
            <related slot="related" v-on:search="searchEvent"/>
            <search slot="search" :initial-status="search"/>
            <browse slot="browse" :initial-status="browse"/>
            <collected slot="collected" :initial-status="collected"/>
        </tabs>
        <authorisation v-if="!authorized"></authorisation>
        <first-run-wizard v-if="firstRun"/>
        <div id="toasts"></div>
    </div>
</template>

<script>
    import Tabs from '@vue/Components/Tabs';
    import SystemService from '@js/Services/SystemService';
    import Browse from '@vue/Components/Popup/Browse';
    import Search from '@vue/Components/Popup/Search';
    import Related from '@vue/Components/Popup/Related';
    import Authorisation from '@vue/Components/Popup/Authorisation';
    import Collected from '@vue/Components/Popup/Collected';
    import MessageService from '@js/Services/MessageService';

    export default {
        el        : '#app',
        components: {
            Collected,
            Authorisation,
            Related,
            Search,
            Browse,
            Tabs,
            'first-run-wizard': () => import (/* webpackChunkName: "FirstRunWizard" */'@vue/Components/Firstrun/FirstRunWizard')
        },

        props: {
            authorized: {
                type   : Boolean,
                default: true
            },
            tab       : {
                type   : String,
                default: 'related'
            },
            search    : {
                type   : Object,
                default: () => {
                    return {
                        query: ''
                    };
                }
            },
            browse    : {
                type   : Object,
                default: () => {
                    return {
                        server: null,
                        info  : false,
                        folder: null
                    };
                }
            },
            collected : {
                type   : Object,
                default: () => {
                    return {
                        current: null
                    };
                }
            },
            firstRun : {
                type   : Boolean,
                default: true
            }
        },

        computed: {
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
                    settings : {
                        icon  : 'tools',
                        label : 'TabTools',
                        action: () => {
                            SystemService.getBrowserApi().runtime.openOptionsPage();
                            window.close();
                        }
                    }
                };
            }
        },

        methods: {
            saveTab($event) {
                let tab = $event.tab === 'settings' ? 'related':$event.tab;

                MessageService
                    .send({type: 'popup.status.set', payload: {tab}});
            },
            searchEvent($event) {
                this.search.query = $event;
                this.$refs.tabs.setActive('search');
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
