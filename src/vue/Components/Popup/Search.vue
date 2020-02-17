<template>
    <div class="search-container">
        <input type="text" id="query" v-model="query" :placeholder="placeholder">
        <password-list :passwords="passwords"/>
        <translate tag="div" class="no-results" say="NoSearchQuery" v-if="query.length === 0"/>
        <translate tag="div"
                   class="no-results"
                   say="NoSearchResults"
                   v-if="query.length !== 0 && passwords.length === 0"/>
    </div>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';
    import Translate from '@vue/Components/Translate';
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        components: {Translate, PasswordList},

        props: {
            initialStatus: {
                type   : Object,
                default: () => {
                    return {
                        query: ''
                    };
                }
            }
        },

        data() {
            return {
                query      : this.initialStatus.query,
                passwords  : [],
                placeholder: LocalisationService.translate('SearchPlaceholder')
            };
        },

        mounted() {
            document.getElementById('query').focus();
            if(this.query.length !== 0) {
                this.search(this.query);
            }
        },

        activated() {
            document.getElementById('query').focus();
            this.search(this.query);
        },

        methods: {
            search(query) {
                MessageService
                    .send({type: 'password.search', payload: {query}})
                    .then((r) => {
                        if(this.query === query) this.passwords = r.getPayload();
                    });

                MessageService
                    .send({type: 'popup.status.set', payload: {tab: 'search', status: {query}}});
            }
        },

        watch: {
            query(query) {
                this.search(query);
            }
        }
    };
</script>

<style lang="scss">
    .search-container {
        input {
            width       : 100%;
            line-height : 3rem;
        }

        .no-results {
            line-height : 3rem;
            text-align  : center;
        }
    }
</style>