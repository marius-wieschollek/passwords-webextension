<template>
    <div class="collected-container">
        <foldout :tabs="tabs" :translate="false" ref="foldout" v-on:switch="switchTab($event)">
            <div class="options" :slot="`${item.getId()}-tab`" v-for="item of items" :key="item.getId()">
                <icon icon="trash-alt" @click="discard(item)"/>
                <icon icon="save" @click="save(item)"/>
            </div>
            <password-mining :item="item" :slot="item.getId()" :key="item.getId()" v-for="item of items"/>
        </foldout>
        <translate tag="div" class="no-results" say="NoCollectedPasswords" v-if="items.length === 0"/>
        <translate class="collected-add-blank" say="AddPasswordForCurrentTab" @click="addBlankPassword" v-if="items.length === 0">
            <icon slot="before" icon="user-plus" font="solid"/>
        </translate>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Foldout from '@vue/Components/Foldout';
    import Translate from '@vue/Components/Translate';
    import MiningClient from '@js/Queue/Client/MiningClient';
    import PasswordMining from '@vue/Components/Password/Mining';
    import MessageService from '@js/Services/MessageService';
    import ErrorManager from '@js/Manager/ErrorManager';
    import PopupStateService from "@js/Services/PopupStateService";
    import ToastService from "@js/Services/ToastService";

    export default {
        components: {Translate, Foldout, Icon, PasswordMining},

        data() {
            return {
                items   : MiningClient.getItems(),
                current : null,
                listener: (i) => { this.addItem(i); }
            };
        },

        created() {
            MiningClient.update.on(this.listener);
        },

        destroyed() {
            MiningClient.update.off(this.listener);
        },

        async mounted() {
            let current = PopupStateService.get('current');
            if(current !== null && this.tabs.hasOwnProperty(current)) {
                this.$refs.foldout.setActive(current);
            }
        },

        computed: {
            tabs() {
                let tabs = {};
                for(let item of this.items) {
                    tabs[item.getId()] = item.getLabel();
                }

                return tabs;
            }
        },

        methods: {
            /**
             *
             * @param {MiningItem} item
             * @return {Promise<void>}
             */
            async save(item) {
                let response = await MiningClient.solveItem(item);
                this.processResponse(response);
            },

            /**
             *
             * @param {MiningItem} item
             * @return {Promise<void>}
             */
            async discard(item) {
                item.setDiscarded(true);
                let response = await MiningClient.solveItem(item);
                this.processResponse(response);
            },

            /**
             * @param {MiningItem} response
             */
            processResponse(response) {
                if(response.getSuccess()) {
                    ToastService
                        .success(response.getFeedback())
                        .catch(ErrorManager.catch);
                } else {
                    ToastService
                        .error(response.getFeedback())
                        .catch(ErrorManager.catch);
                }
                this.items = MiningClient.getItems();
            },

            /**
             *
             * @param {{tab: String}} $event
             */
            switchTab($event) {
                this.current = $event.tab;
            },

            /**
             * @param {MiningItem} item
             */
            addItem(item) {
                this.items.push(item);
            },

            addBlankPassword() {
                MessageService
                    .send('password.add.blank')
                    .catch(ErrorManager.catchEvt);
            },

            sendStatus() {
                PopupStateService.set('current', this.current);
            }
        },

        watch: {
            current() {
                this.sendStatus();
            }
        }
    };
</script>

<style lang="scss">
.collected-container {
    .no-results {
        line-height : 3rem;
        text-align  : center;
    }

    .collected-add-blank {
        position         : fixed;
        bottom           : 0;
        padding          : 1rem;
        width            : 100%;
        border-top       : 1px solid var(--element-active-fg-color);
        background-color : var(--element-active-bg-color);
        color            : var(--element-active-hover-fg-color);
        cursor           : pointer;
        transition       : var(--element-transition);

        &:hover {
            background-color : var(--element-active-hover-bg-color);
        }

        .icon {
            margin-right : .5rem;
        }
    }
}
</style>