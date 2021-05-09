<template>
    <div class="related-container">
        <password-list :passwords="passwords" :menus="false"/>
        <translate tag="div" class="no-results" say="NoRelatedPasswords" v-if="passwords.length === 0"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import MessageService from '@js/Services/MessageService';
    import PasswordList from '@vue/Components/List/PasswordList';
    import SettingsService from '@js/Services/SettingsService';

    export default {
        components: {Translate, PasswordList},
        data() {
            return {
                hasSearch: false,
                passwords: []
            };
        },

        mounted() {
            this.reloadData();
        },

        activated() {
            this.reloadData();

            SettingsService.getValue('popup.related.search')
                .then((value) => {
                    if(value) {
                        document.addEventListener('keypress', this.search);
                        this.hasSearch = true;
                    }
                });
        },

        deactivated() {
            if(this.hasSearch) {
                document.removeEventListener('keypress', this.search);
                this.hasSearch = false;
            }
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
                if(event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && event.key.length === 1) {
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