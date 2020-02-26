<template>
    <div class="toast-container">
        <transition v-for="toast in toasts" :key="toast.id">
            <toast :toast="toast" v-on:close="onClose(toast, $event)"/>
        </transition>
    </div>
</template>

<script>
    import Toast from '@vue/Components/Toast/Toast';
    import ToastService from '@js/Services/ToastService';

    export default {
        components: {Toast},
        props     : {
            toasts: {
                type     : Array,
                'default': () => {
                    return [];
                }
            }
        },
        methods   : {
            /**
             * @param {Toast} toast
             * @param $event
             */
            onClose(toast, $event) {
                ToastService.choose(toast.getId(), $event);
            }
        }
    };
</script>

<style lang="scss">
    .toast-container {
        position : absolute;
        right    : 0;
        bottom   : 0;
        left     : 0;
    }
</style>