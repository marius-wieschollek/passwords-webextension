<template>
    <div id="manager">
        <tabs :tabs="tabs" :initial-tab="currentTab" v-if="isAuthorized">
            <related slot="related"/>
            <search slot="search" :initial-query="search.query" :initial-passwords="search.results"/>
            <browse slot="browse"/>
        </tabs>
        <authorisation v-if="!isAuthorized"></authorisation>
    </div>
</template>

<script>
    import Tabs from '@vue/Components/Tabs';
    import SystemService from '@js/Services/SystemService';
    import Browse from '@vue/Components/Popup/Browse';
    import Search from '@vue/Components/Popup/Search';
    import Related from '@vue/Components/Popup/Related';
    import Authorisation from '@vue/Components/Popup/Authorisation';

    export default {
        el        : '#app',
        components: {
            Authorisation,
            Related,
            Search,
            Browse,
            Tabs
        },

        props: {
            isAuthorized: {
                type   : Boolean,
                default: true
            },
            currentTab  : {
                type   : String,
                default: 'related'
            },
            search      : {
                type   : Object,
                default: () => {
                    return {
                        query  : '',
                        results: []
                    };
                }
            }
        },

        computed: {
            tabs() {
                return {
                    related : {
                        icon : 'key',
                        label: 'TabRelated'
                    },
                    search  : {
                        icon : 'search',
                        label: 'TabSearch'
                    },
                    browse  : {
                        icon : 'server',
                        label: 'TabBrowse'
                    },
                    collect : {
                        icon : 'history',
                        label: 'TabCollected'
                    },
                    settings: {
                        icon  : 'tools',
                        label : 'TabTools',
                        action: () => {
                            SystemService.getBrowserApi().runtime.openOptionsPage();
                            window.close();
                        }
                    }
                };
            }
        }
    };
</script>

<style lang="scss">
    body {
        width      : 360px;
        height     : 360px;
        display    : block;
        box-sizing : border-box;
    }

    #manager {
        width   : 360px;
        height  : 360px;
        display : block;
        overflow: hidden;

        > .tab-container > .tabs .tab {
            overflow   : hidden;
            max-width  : 15rem;
            transition : max-width .25s ease-in-out;
            box-sizing : border-box;

            .label {
                opacity    : 1;
                transition : opacity .25s ease-in-out;
            }

            &:not(.active) {
                max-width : 3rem;

                .label {
                    opacity : 0;
                }
            }
        }

        > .tab-container > .tab-content {
            max-height : calc(100vh - 3rem - 2px);
            overflow   : auto;
        }
    }
</style>
