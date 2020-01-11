<template>
    <div class="related-container">
        <password-list :passwords="passwords" />
        <translate tag="div" class="no-results" say="NoRelatedPasswords" v-if="passwords.length === 0"/>
    </div>
</template>

<script>
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate, PasswordList},
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

<style lang="scss">
    .related-container {
        .no-results {
            line-height : 3rem;
            text-align  : center;
        }
    }
</style>