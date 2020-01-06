<template>
    <div>
        <input type="text" id="query" v-model="query">
        <password-list :passwords="passwords" />
    </div>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';

    export default {
        components: {PasswordList},

        data() {
            return {
                query    : '',
                passwords: []
            };
        },

        mounted() {
            document.getElementById('query').focus();
        },

        watch: {
            query(query) {
                MessageService
                    .send({type: 'password.search', payload: {query}})
                    .then((r) => {
                        if(this.query === query) this.passwords = r.getPayload();
                    });
            }
        }
    };
</script>

<style scoped>

</style>