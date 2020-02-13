<template>
    <img class="favicon" :src="src" :width="size" :height="size" alt=""/>
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
                src: null
            };
        },

        mounted() {
            this.resolveIconUrl();
        },

        computed: {
            style() {
                return {
                    'background-image': `url(${this.src})`,
                    width             : this.size,
                    height            : this.size
                };
            }
        },

        methods: {
            async resolveIconUrl() {
                this.src = null;
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
            }
        },

        watch: {
            password() {
                this.resolveIconUrl();
            }
        }
    };
</script>