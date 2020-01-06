<template>
    <password-list :passwords="passwords" />
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';

    export default {
        components: {PasswordList},
        data() {
            return {
                passwords: []
            };
        },

        mounted() {
            MessageService
                .send({type: 'password.related'})
                .then((r) => {
                    this.passwords = r.getPayload();
                });
        }

    };
</script>