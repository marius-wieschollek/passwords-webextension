<template>
    <div class="toast-container">
        <transition-group name="toast" tag="div" appear>
            <toast :toast="toast" v-on:choose="onChoose(toast, $event)" v-for="toast in toasts" :key="toast.getId()"/>
        </transition-group>
    </div>
</template>

<script>
    import Toast from '@vue/Components/Toast/Toast';
    import ToastService from '@js/Services/ToastService';

    export default {
        components: {Toast},
        data() {
            return {
                toasts: []
            };
        },

        methods: {
            /**
             * @param {Toast} toast
             * @param $event
             */
            onChoose(toast, $event) {
                ToastService.choose(toast.getId(), $event);
            },
            updateToasts(toasts) {
                this.toasts = toasts;
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
    z-index  : 999;

    .toast-leave-active {
        animation : toast-leave .5s;

        &.modal {
            animation : toast-modal-leave .25s;
        }
    }

    .toast-enter-active {
        animation : toast-enter .5s ease-in;

        &.modal {
            animation : toast-modal-enter .25s ease-in;
        }
    }

    @keyframes toast-enter {
        0% {
            max-height : 0;
        }
        100% {
            max-height : 100vh;
        }
    }

    @keyframes toast-leave {
        0% {
            opacity    : 1;
            max-height : 100vh;
        }
        100% {
            opacity    : 0;
            max-height : 0;
        }
    }

    @keyframes toast-modal-enter {
        0% {
            opacity : 0;
        }
        100% {
            opacity : 1;
        }
    }

    @keyframes toast-modal-leave {
        0% {
            opacity : 1;
        }
        100% {
            opacity : 0;
        }
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