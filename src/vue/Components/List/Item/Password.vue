<template>
    <li class="item password-item">
        <div class="label" @click="sendPassword()" :title="password.getId()">
            {{password.getLabel()}}
        </div>
        <div class="options">
            <icon icon="clipboard" @click="copy('password')" @dblclick="copy('username')"/>
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
            },
            copy(property, $event) {
                let data = this.password._getProperty(property);
                navigator.clipboard.writeText(data);
            }
        }
    };
</script>

<style lang="scss">
    .item.password-item {
        line-height : 3rem;
        font-size   : 1rem;
        color       : var(--main-text-color);
        cursor      : pointer;
        display     : flex;
        overflow    : hidden;

        > * {
            flex-grow   : 0;
            flex-shrink : 0;
        }

        > .label {
            flex-grow  : 1;
            padding    : 0 .5rem;
            min-width  : 100vw;
            transition : min-width .25s ease-in-out;
        }

        .options {
            opacity          : 0;
            background-color : var(--element-primary-background-color);
            color            : var(--element-primary-hover-text-color);
            transition       : opacity 0s linear .25s;

            .icon {
                text-align : center;
                width      : 3rem;
                display    : block;
            }
        }

        &:hover {
            background-color : var(--element-primary-hover-background-color);
            color            : var(--element-primary-hover-text-color);

            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                opacity    : 1;
                transition : none;
            }
        }
    }

    body.mobile {
        .item.password-item {
            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                opacity          : 1;
                transition       : none;
                background-color : transparent;
                color            : var(--content-primary-text-color);
            }

            &:hover {
                .options {
                    opacity          : 1;
                    transition       : none;
                    background-color : transparent;
                    color            : var(--element-primary-hover-text-color);
                }
            }
        }
    }
</style>