<template>
    <div class="search">
        <div class="searchbox-container">
            <input type="text"
                   id="searchbox"
                   class="theme-invert theme-bg-border"
                   placeholder="..."
                   v-on:keyup="updateQuery($event)">
        </div>
        <login v-for="(match, i) in matches" :key="i" :login="match"/>
        <translate tag="div"
                   v-if="this.matches.length === 0 && this.query.length > 2"
                   class="no-matches theme-invert"
                   say="NoSearchMatches"/>
        <translate tag="div"
                   v-if="this.matches.length === 0 && this.query.length < 3"
                   class="no-matches theme-invert"
                   say="NoSearchQuery"/>
    </div>
</template>

<script>
    import $ from "jquery";
    import Login from '@vue/Partials/Login.vue';
    import Translate from '@vue/Partials/Translate.vue';

    export default {
        components: {
            Login,
            Translate
        },

        data() {
            return {
                passwords: [],
                matches  : [],
                query    : ''
            }
        },

        created() {
            this.loadPasswords();
            browser.storage.onChanged.addListener(this.loadPasswords);
        },

        methods: {
            loadPasswords: function () {
                let runtime = browser.runtime.getBrowserInfo ? browser.runtime:chrome.runtime;
                runtime
                    .sendMessage(runtime.id, {type: 'passwords'})
                    .then((d) => {
                        if(!d) return;
                        this.passwords = d;
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

                for (let i = 0; i < this.passwords.length; i++) {
                    let entry = $.extend({}, this.passwords[i]);

                    if (entry.user.indexOf(this.query) !== -1 ||
                        (entry.host !== null && entry.host.indexOf(this.query) !== -1) ||
                        entry.notes.indexOf(this.query) !== -1 ||
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
    }

    .no-matches {
        padding    : 10px;
        text-align : center;
    }
</style>