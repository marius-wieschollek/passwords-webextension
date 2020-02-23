<template>
    <li class="item password-item">
        <div class="label" @click="sendPassword()" :title="password.getId()">
            <favicon :password="password.getId()" :size="22" v-if="favicon"/>
            {{password.getLabel()}}
        </div>
        <div class="options">
            <icon icon="user" hover-icon="clipboard" @click="copy('username')"/>
            <icon icon="key" font="solid" hover-icon="clipboard" hover-font="regular" @click="copy('password')"/>
        </div>
    </li>
</template>

<script>
    import Password from 'passwords-client/src/Model/Password/Password';
    import Icon from '@vue/Components/Icon';
    import MessageService from '@js/Services/MessageService';
    import Favicon from '@vue/Components/List/Item/Favicon';
    import ToastService from '@js/Services/ToastService';

    export default {
        components: {Favicon, Icon},
        props     : {
            password: {
                type: Password
            },
            favicon : {
                type   : Boolean,
                default: false
            }
        },

        methods: {
            sendPassword() {
                MessageService.send(
                    {
                        type   : 'password.fill',
                        payload: this.password.getId()
                    }
                );
            },
            copy(property) {
                let data = this.password.getProperty(property);
                navigator.clipboard.writeText(data);
                ToastService.info(`Copied ${property}`, null, null, 3);
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
            flex-grow   : 1;
            padding     : 0 .5rem;
            min-width   : 100vw;
            white-space : nowrap;
            transition  : min-width .25s ease-in-out;

            .favicon {
                vertical-align : middle;
                border-radius  : 3px;
                padding        : .5rem;
                width          : 1.5rem;
                height         : 1.5rem;
                box-sizing     : content-box;
                margin-left    : -.5rem;

                &.error {
                    padding    : .75rem;
                    max-width  : 1rem;
                    max-height : 1rem;
                }
            }
        }

        .options {
            opacity    : 0;
            transition : opacity 0s linear .25s;
            display    : flex;

            .icon {
                text-align : center;
                width      : 3rem;
                display    : inline-block;
            }
        }

        &:hover {
            background-color : var(--element-secondary-hover-background-color);
            color            : var(--element-secondary-hover-text-color);

            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                background-color : var(--element-secondary-hover-background-color);

                > .icon:hover,
                > .option:hover {
                    background-color : var(--element-primary-background-color);
                    color            : var(--element-primary-text-color);
                }

                opacity          : 1;
                transition       : none;
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
                opacity    : 1;
                transition : none;
                color      : var(--content-primary-text-color);
            }
        }
    }
</style>