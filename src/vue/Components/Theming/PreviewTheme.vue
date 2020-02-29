<template>
    <iframe :src="url" class="theme-preview"/>
</template>

<script>
    export default {
        props: {
            theme: {
                type: String
            }
        },

        data() {
            return {
                url: 'about:blank'
            };
        },

        mounted() {
            this.url = 'preview.html';
        },

        watch: {
            theme(value, oldValue) {
                if(oldValue !== null) this.$el.contentWindow.location.reload();
            }
        }
    };
</script>

<style lang="scss">
    .theme-preview {
        height : 360px;
        border : 1px solid var(--element-hover-bg-color);
    }
</style>