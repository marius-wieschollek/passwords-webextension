<template>
    <div class="related-container">
        <password-list :passwords="passwords"/>
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
            this.reloadData();
        },

        activated() {
            this.reloadData();
            document.addEventListener('keypress', this.search);
        },

        deactivated() {
            document.removeEventListener('keypress', this.search);
        },

        methods: {
            reloadData() {
                MessageService
                    .send({type: 'password.related'})
                    .then((r) => {
                        this.passwords = r.getPayload();
                    });
            },
            search(event) {
                if(event.key.length === 1) {
                    this.$emit('search', event.key);
                }
            }
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