<template>
    <div class="search">
        <div class="searchbox-container">
            <input type="text"
                   id="searchbox"
                   class="theme-invert theme-bg-border"
                   placeholder="..."
                   v-on:keyup="updateQuery($event)">
        </div>
        <login v-for="(match, i) in matches" :key="i" :login="match"></login>
        <translate tag="div" v-if="matches.length == 0 && query" class="no-accounts theme-invert">No matches</translate>
        <translate tag="div" v-if="matches.length == 0 && !query" class="no-accounts theme-invert">Type to search</translate>
    </div>
</template>

<script>
    import $ from "jquery";
    import API from '@js/Helper/api';
    import Login from '@vue/Partials/Login.vue';
    import Translate from '@vue/Partials/Translate.vue';

    export default {
        components: {
            Login,
            Translate
        },

        data() {
            return {
                database: [],
                matches : [],
                query   : ''
            }
        },

        created() {
            this.loadPasswords();
            browser.storage.onChanged.addListener(this.loadPasswords);
        },

        methods: {
            loadPasswords: function () {
                API.getPasswords().then((d) => {
                    this.database = d;
                    this.search();
                })
            },
            updateQuery($event) {
                this.query = $($event.target).val();
                this.search();
            },
            search       : function () {
                let matches = [];

                if (this.query.length < 3) {
                    this.matches = [];
                    return;
                }

                for (let i = 0; i < this.database.length; i++) {
                    let entry = $.extend({}, this.database[i]);

                    if (entry.user.indexOf(this.query) !== -1 ||
                        entry.host.indexOf(this.query) !== -1 ||
                        entry.password.indexOf(this.query) !== -1
                    ) {
                        entry.title += '@' + entry.host;
                        matches.push(entry);
                    }

                    this.matches = matches;
                }
            }
        }
    }
</script>

<style lang="scss">
    .searchbox-container {
        display : flex;
    }

    #searchbox {
        flex-grow           : 1;
        padding             : 5px;
        display             : block;
        outline             : 5px solid transparent;
        margin              : 5px;
        border              : 0 solid transparent;
        border-bottom-width : 1px;
        font-size           : 12pt;
    }

    .no-accounts {
        padding    : 10px;
        text-align : center;
    }
</style>