<template>
    <img :class="className" :src="src" :width="size" :height="size" alt="" @error="showDefaultIcon()"/>
</template>

<script>

    import MessageService from '@js/Services/MessageService';

    export default {
        props: {
            password: {
                type: String
            },
            size    : {
                type   : Number,
                default: 32
            }
        },

        data() {
            return {
                src  : null,
                error: false
            };
        },

        mounted() {
            this.resolveIconUrl();
        },

        computed: {
            className() {
                return 'favicon ' + (this.error ? 'error':'');
            }
        },

        methods: {
            async resolveIconUrl() {
                this.src = null;
                this.error = false;
                let reply = await MessageService.send(
                    {
                        type   : 'password.favicon',
                        payload: {
                            password: this.password,
                            size    : this.size
                        }
                    }
                );
                this.src = reply.getPayload();
            },
            async showDefaultIcon() {
                this.src = null;
                let reply = await MessageService.send(
                    {
                        type   : 'password.favicon',
                        payload: {
                            password: null,
                            size    : this.size
                        }
                    }
                );
                this.error = true;
                this.src = reply.getPayload();
            }
        },

        watch: {
            password() {
                this.resolveIconUrl();
            }
        }
    };
</script>