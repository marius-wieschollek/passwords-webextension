<template>
    <div class="first-run-complete" @click="close">
        <icon icon="check-circle"/>
    </div>
</template>

<script>
    import Icon from "@vue/Components/Icon.vue";

    export default {
        components: {Icon},
        mounted() {
            setTimeout(
                () => {this.close();},
                500
            );
        },
        methods: {
            close() {
                this.$emit('close');
            }
        }
    };
</script>

<style lang="scss">
.first-run-complete {
    display         : flex;
    align-items     : center;
    height          : 100%;
    justify-content : center;

    .icon {
        display     : block;
        font-size   : 8rem;
        line-height : 8rem;
        color       : var(--success-bg-color);
    }
}
</style>