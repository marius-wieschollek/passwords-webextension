<template>
    <div class="toast-container">
        <transition name="toast" v-for="toast in toasts" :key="toast.id" appear>
            <div>
                <toast :toast="toast" v-on:close="onClose(toast, $event)"/>
            </div>
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

        methods: {
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
        overflow : hidden;

        .toast-leave-active {
            transition : opacity 1s;
        }

        .toast-leave-to {
            opacity : 0;
        }

        .toast-enter-active {
            transition : max-height 2s;
        }

        .toast-enter {
            max-height : 0;
        }

        .toast-enter-to {
            max-height : 100vh;
        }
    }

    @media (min-width : 361px) {
        #options {
            .toast-container {
                left  : auto;
                width : 50vw;
            }
        }
    }
</style>