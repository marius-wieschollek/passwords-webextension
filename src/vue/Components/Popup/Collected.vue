<template>
    <div class="collected-container">
        <foldout :tabs="tabs" :translate="false" ref="foldout" v-on:switch="switchTab($event)">
            <div class="options" :slot="`${item.getId()}-tab`" v-for="item of items" :key="item.getId()">
                <icon icon="trash-alt" @click="discard(item)"/>
                <icon icon="save" @click="save(item)"/>
            </div>
            <mining-item :item="item" :slot="item.getId()" :key="item.getId()" v-for="item of items"/>
        </foldout>
        <translate tag="div" class="no-results" say="NoCollectedPasswords" v-if="items.length === 0"/>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Foldout from '@vue/Components/Foldout';
    import Translate from '@vue/Components/Translate';
    import MiningClient from '@js/Queue/Client/MiningClient';
    import MiningItem from '@vue/Components/Collected/MiningItem';
    import MessageService from '@js/Services/MessageService';

    export default {
        components: {MiningItem, Translate, Foldout, Icon},

        props: {
            initialStatus: {
                type   : Object,
                default: () => {
                    return {
                        current: null
                    };
                }
            }
        },

        data() {
            return {
                items  : MiningClient.getItems(),
                current: null,
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
            if(this.initialStatus.current !== null && this.tabs.hasOwnProperty(this.initialStatus.current)) {
                this.$refs.foldout.setActive(this.initialStatus.current);
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
                await MiningClient.solveItem(item);
                this.items = MiningClient.getItems();
            },

            /**
             *
             * @param {MiningItem} item
             * @return {Promise<void>}
             */
            async discard(item) {
                item.setDiscarded(true);
                await MiningClient.solveItem(item);
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

            sendStatus() {
                let status = {
                    current: this.current
                };
                MessageService
                    .send({type: 'popup.status.set', payload: {tab: 'collected', status}});
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
    }
</style>