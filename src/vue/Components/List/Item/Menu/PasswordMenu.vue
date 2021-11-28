<template>
    <div class="item-menu password-menu" v-if="show">
        <translate tag="div" class="menu-item" say="PasswordItemOpenUrl" v-if="password.getUrl()" @click="openUrl">
            <icon icon="globe-europe" font="solid" slot="before"/>
            <icon class="option" icon="clipboard" slot="after" @click.stop="$emit('copy', 'url')"/>
        </translate>
        <translate tag="div" class="menu-item" say="PasswordItemDetails" @click="$emit('details')">
            <icon icon="file-alt" font="solid" slot="before"/>
        </translate>
        <translate tag="div" class="menu-item" say="PasswordItemToTrash" @click="moveToTrash">
            <icon icon="trash" font="solid" slot="before"/>
        </translate>
    </div>
</template>

<script>
    import Translate from "@vue/Components/Translate";
    import Icon from "@vue/Components/Icon";
    import {Password} from "passwords-client/models";
    import MessageService from "@js/Services/MessageService";
    import ErrorManager from "@js/Manager/ErrorManager";
    import ToastService from "@js/Services/ToastService";

    export default {
        components: {Translate, Icon},
        props     : {
            password: {
                type: Password
            },
            show    : {
                type   : Boolean,
                default: false
            }
        },
        methods   : {
            openUrl() {
                MessageService.send({type: 'tab.create', payload: {url: this.password.getUrl()}}).catch(ErrorManager.catch);
            },
            async moveToTrash() {
                try {
                    let response = await MessageService.send({type: 'password.delete', payload: {id: this.password.getId()}});

                    if(response.getPayload().success) {
                        this.$emit('delete');
                    } else {
                        ToastService
                            .error('ToastPasswordDeleteFailed')
                            .catch(ErrorManager.catch);
                    }
                } catch(e) {
                    ErrorManager.logError(e);
                }
            }
        }
    };
</script>

<style lang="scss">
.item-menu.password-menu {
    background-color : var(--element-hover-bg-color);
    color            : var(--element-hover-fg-color);

    .menu-item {
        line-height : 3rem;
        cursor      : pointer;
        display     : flex;

        .icon {
            text-align : center;
            width      : 3rem;
            display    : inline-block;
        }

        .option {
            background-color : var(--button-bg-color);
            color            : var(--button-fg-color);
            transition       : var(--button-transition);
            margin-left      : auto;

            &:hover {
                background-color : var(--button-hover-bg-color);
                color            : var(--button-hover-fg-color);
            }
        }

        &:hover {
            background-color : var(--element-active-hover-bg-color);
            color            : var(--element-active-hover-fg-color);
        }
    }
}
</style>