<template>
    <div class="demo-menu" :class="{open: showMenu}">
        <icon class="menu-toggle" icon="ellipsis-h" font="solid" @click="showMenu = !showMenu"/>
        <ul class="demo-menu">
            <translate tag="li" say="DemoInfoNotification" @click="notifyInfo"/>
            <translate tag="li" say="DemoSuccessNotification" @click="successInfo"/>
            <translate tag="li" say="DemoWarningNotification" @click="warningInfo"/>
            <translate tag="li" say="DemoErrorNotification" @click="errorInfo"/>
        </ul>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Translate from '@vue/Components/Translate';
    import ToastService from '@js/Services/ToastService';
    import LocalisationService from '@js/Services/LocalisationService';

    export default {
        components: {Translate, Icon},
        data() {
            return {
                showMenu: false,
                func    : () => {},
                text    : LocalisationService.translate('DemoText')
            };
        },

        methods: {
            notifyInfo() {
                ToastService.info('DemoInfoNotification', 'DemoInfoNotification', {a: this.text, b: this.text}, 0);
            },
            successInfo() {
                ToastService.success('DemoSuccessNotification', 'DemoSuccessNotification', 0);
            },
            warningInfo() {
                ToastService.warning('DemoWarningNotification', 'DemoWarningNotification', 0);
            },
            errorInfo() {
                ToastService.error('DemoErrorNotification', 'DemoErrorNotification', 0);
            }
        }
    };
</script>

<style lang="scss">
    :root {
        --font-family : Ubuntu, Calibri, sans-serif;
    }

    .demo-menu {
        position : absolute;
        z-index  : 0;

        .menu-toggle {
            background-color : var(--button-hover-bg-color);
            color            : var(--button-hover-fg-color);
            position         : absolute;
            left             : .5rem;
            bottom           : .5rem;
            padding          : .5rem;
            border-radius    : 50%;
            cursor           : pointer;
            opacity          : .5;
            transition       : var(--fade-transition);
        }

        .demo-menu {
            border-radius    : .25rem;
            background-color : var(--button-hover-bg-color);
            color            : var(--button-hover-fg-color);
            position         : absolute;
            left             : 2rem;
            bottom           : .5rem;
            margin           : 0;
            padding          : 0;
            list-style       : none;
            display          : none;

            li {
                padding     : .25rem;
                border-top  : 1px solid rgba(0, 0, 0, .25);
                cursor      : pointer;
                white-space : nowrap;

                &:hover {
                    background-color : rgba(0, 0, 0, .25);
                    border-color     : rgba(0, 0, 0, 0);
                }

                &:first-of-type {
                    border-top : 0;
                }
            }
        }

        &.open {
            transition : z-index 1s;

            .menu-toggle {
                border-radius : 50% 0 0 50%;
                opacity       : 1;
            }

            .demo-menu {
                display : block;
            }
        }

        &:hover {
            z-index    : 1;
            transition : none;

            .menu-toggle {
                opacity : 1;
            }
        }
    }
</style>