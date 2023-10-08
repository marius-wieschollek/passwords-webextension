<template>
    <div class="search-container">
        <input ref="query" type="search" id="query" v-model="query" :placeholder="placeholder">
        <password-list :passwords="passwords" v-on:delete="search(query)" />
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
    import PopupStateService from "@js/Services/PopupStateService";

    export default {
        components: {Translate, PasswordList},

        data() {
            let query = PopupStateService.get('query');
            if(query === null) {query = '';}

            return {
                query,
                passwords  : [],
                placeholder: LocalisationService.translate('SearchPlaceholder'),
                interval   : null
            };
        },

        mounted() {
            this.focus();
            if(this.query.length !== 0) {
                this.search(this.query);
            }
            this.interval = setInterval(
                () => {
                    if(this.query.length !== 0) {
                        this.search(this.query);
                    }
                },
                2000
            );
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
            if(this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        },

        methods: {
            focus() {
                if(document.getElementsByClassName("password-details-view").length === 0) {
                    this.$refs.query.focus();
                }
            },
            search(query) {
                MessageService
                    .send({type: 'password.search', payload: {query}})
                    .then((r) => {
                        if(this.query === query) this.passwords = r.getPayload();
                    });

                PopupStateService.set('query', query);
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