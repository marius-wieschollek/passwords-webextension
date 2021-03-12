<template>
    <div ref="options" class="options">

        <div class="menu" :style="menuStyle" v-show="show" v-click-outside="close">
            <div class="item" @click="openUrl($event)">
                <translate class="label" say="ContextMenuOpenPasswordUrl" />
            </div>
            <div class="item" @click="copy($event, 'url')">
                <translate class="label" say="ContextMenuCopyPasswordUrl" />
            </div>
        </div>
        
  </div>
</template>

<script>
    import Password            from 'passwords-client/src/Model/Password/Password';
    import Icon                from '@vue/Components/Icon';
    import Translate           from '@vue/Components/Translate';
    import ToastService        from '@js/Services/ToastService';
    import MessageService      from '@js/Services/MessageService';
    import ErrorManager        from '@js/Manager/ErrorManager';
    import LocalisationService from '@js/Services/LocalisationService';
    import Vue                 from 'vue'

    Vue.directive('click-outside', {
        bind: function (el, binding, vnode) {
            window.event = function (event) {
                if (!(el == event.target || el.contains(event.target))) {
                    vnode.context[binding.expression](event)
                }
            };
            document.body.addEventListener('click', window.event)
        },
        unbind: function (el) {
            document.body.removeEventListener('click', window.event)
        }
    })

    export default {
        components: {Icon, Translate},
        props     : {
            password: {
                type: Password
            },
            show: {
                type: Boolean
            }
        },

        data() {
            return {
                menuStyle: ""
            }
        },

        mounted() {
            var position = this.$refs.options.getBoundingClientRect();
            this.menuStyle = 'top: ' + position.bottom + 'px;';
        },

        methods: {
            close(event){
                this.show = false;
                document.body.removeEventListener('click', window.event);
                event.stopPropagation();
            },
            openUrl(event) {
                this.close(event);
                MessageService.send({type: 'password.url.open', payload: {url: this.password.getProperty('url')}}).catch(ErrorManager.catch);
            },
            copy(event, property) {
                let data = this.password.getProperty(property);
                MessageService.send({type: 'clipboard.write', payload: {type: 'text', value: data}}).catch(ErrorManager.catch);

                let label = property.capitalize();
                if(['password', 'username', 'url'].indexOf(property) === -1) {
                    label = LocalisationService.translate(`Property${property}`);
                }

                ToastService.success(['PasswordPropertyCopied', label])
                            .catch(ErrorManager.catch);
                this.close(event);
            }
        }
    }
</script>

<style lang="scss">
.menu {
    position         : fixed;
    z-index          : inherit + 100;
    right            : 0;
    min-width        : 5rem;
    background-color : var(--element-bg-color);
    color            : var(--element-fg-color);
    border           : 1px;
    border-radius    : var(--element-border-radius);
    border-color     : var(--element-fg-color);
    border-style     : ridge;
    cursor           : pointer;
    line-height      : 2rem;
    font-size        : 1rem;
    
    .item {
        padding       : 0 .5rem 0 .5rem;

        &:hover {
            background-color : var(--element-hover-bg-color);
            color            : var(--element-hover-fg-color);
        }
    }
}

</style>