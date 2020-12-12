<template>
    <div class="search-container">
        <input ref="query" type="search" id="query" v-model="query" :placeholder="placeholder">
        <password-list :passwords="passwords"/>
        <translate tag="div" class="no-results" say="NoSearchQuery" @click="focus" v-if="query.length === 0"/>
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
            this.focus();
            if(this.query.length !== 0) {
                this.search(this.query);
            }
        },

        activated() {
            document.addEventListener('keydown', this.focus);
            this.focus();
            if(this.query.length !== 0) {
                this.search(this.query);
            }
        },

        deactivated() {
            document.removeEventListener('keydown', this.focus);
        },

        methods: {
            focus() {
               this.$refs.query.focus();
            },
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
            },
            "initialStatus.query"(query) {
                this.query = query;
            }
        }
    };
</script>

<style lang="scss">
.search-container {
    input {
        width            : 100%;
        line-height      : 3rem;
        padding          : 0 .5rem;
        border           : none;
        border-bottom    : 2px solid var(--element-active-fg-color);
        background-color : var(--element-active-hover-bg-color);
        color            : var(--element-active-hover-fg-color);
    }

    .no-results {
        line-height : 3rem;
        text-align  : center;
    }
}
</style>