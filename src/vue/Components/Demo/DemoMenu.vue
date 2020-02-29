<template>
    <div class="demo-menu" :class="{open: showMenu}">
        <icon class="menu-toggle" icon="ellipsis-h" font="solid" @click="showMenu = !showMenu"/>
        <ul class="demo-menu">
            <translate tag="li" say="DemoInfoNotification" @click="notifyInfo"/>
            <translate tag="li" say="DemoSuccessNotification" @click="successInfo"/>
            <translate tag="li" say="DemoWarningNotification" @click="warningInfo"/>
            <translate tag="li" say="DemoErrorNotification" @click="errorInfo"/>
            <translate tag="li" say="DemoDataInsert" @click="demoData"/>
        </ul>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Translate from '@vue/Components/Translate';
    import ToastService from '@js/Services/ToastService';
    import Password from 'passwords-client/src/Model/Password/Password';
    import Preview from '@js/App/Preview';

    export default {
        components: {Translate, Icon},
        data() {
            return {
                showMenu: false
            };
        },

        mounted() {
            this.demoData();
        },

        methods: {
            notifyInfo() {
                ToastService.info('DemoInfoNotification', 'Demo', {a: 'Demo', b: 'Demo'});
            },
            successInfo() {
                ToastService.success('DemoSuccessNotification', 'Success');
            },
            warningInfo() {
                ToastService.warning('DemoWarningNotification', 'Warning');
            },
            errorInfo() {
                ToastService.error('DemoErrorNotification', 'Error');
            },
            async demoData() {
                let passwords = [
                    new Password({label: 'Demo', username: 'demo', password: 'demo'}),
                    new Password({label: 'Demo', username: 'demo', password: 'demo'})
                ];

                let func = Preview.app.$refs.search.search;
                Preview.app.$refs.search.search = () => {};
                Preview.app.$refs.search.query = 'demo';
                Preview.app.$refs.search.search = func;

                Preview.app.$refs.search.passwords = passwords;
                Preview.app.$refs.related.passwords = passwords;
            }
        }
    };
</script>

<style lang="scss">
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
                padding    : .25rem;
                border-top : 1px solid rgba(0, 0, 0, .25);
                cursor     : pointer;
                white-space: nowrap;

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