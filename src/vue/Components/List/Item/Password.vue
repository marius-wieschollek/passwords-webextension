<template>
    <li class="item password-item">
        <div class="label" @click="sendPassword()">
            {{password.getLabel()}}
        </div>
        <div class="options">
            <icon icon="clipboard"/>
        </div>
    </li>
</template>

<script>
    import Password from 'passwords-client/src/Model/Password';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {Icon},
        props     : {
            password: {
                type   : Password,
                default: null
            }
        },
        methods   : {
            sendPassword() {
                MessageService.send(
                    {
                        type   : 'password.fill',
                        payload: this.password.getId()
                    }
                );
            }
        }
    };
</script>

<style lang="scss">
    .item.password-item {
        line-height           : 3rem;
        font-size             : 1rem;
        color                 : var(--main-text-color);
        cursor                : pointer;
        display               : grid;
        grid-template-columns : 100vw 3rem;
        overflow              : hidden;
        transition            : grid-template-columns 0.25s ease-in-out;

        .label {
            padding : 0 0.5rem;
        }

        .options {
            background-color : var(--element-primary-background-color);
            color            : var(--element-primary-hover-text-color);

            .icon {
                text-align : center;
                width      : 3rem;
                display    : block;
            }
        }

        &:hover {
            background-color      : var(--element-primary-hover-background-color);
            color                 : var(--element-primary-hover-text-color);
            grid-template-columns : calc(100% - 3rem) 3rem;
        }
    }
</style>