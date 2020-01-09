<template>
    <div>
        <input type="text" id="query" v-model="query">
        <password-list :passwords="passwords"/>
    </div>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';

    export default {
        components: {PasswordList},

        props: {
            initialQuery: {
                type   : String,
                default: ''
            },
            initialPasswords: {
                type   : Array,
                default: () => { return []; }
            }
        },

        data() {
            return {
                query: this.initialQuery,
                passwords: this.initialPasswords
            };
        },

        mounted() {
            document.getElementById('query').focus();
        },

        methods: {
            search(query) {
                MessageService
                    .send({type: 'password.search', payload: {query}})
                    .then((r) => {
                        if(this.query === query) this.passwords = r.getPayload();
                    });
            }
        },

        watch: {
            query(query) {
                this.search(query);
            }
        }
    };
</script>

<style scoped>

</style>