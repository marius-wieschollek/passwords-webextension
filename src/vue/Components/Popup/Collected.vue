<template>
    <div class="collected-container">
        <foldout :tabs="tabs" :translate="false">
            <icon icon="save" :slot="`${item.getId()}-tab`" :key="item.getId()" v-for="item of items" @click="save(item)"/>
            <div :slot="item.getId()" :key="item.getId()" v-for="item of items">
                <div v-for="(field, name) in item.getFields()">
                    {{name}}: {{field}}
                </div>
            </div>
        </foldout>
        <translate tag="div" class="no-results" say="NoCollectedPasswords" v-if="items.length === 0"/>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Foldout from '@vue/Components/Foldout';
    import Translate from '@vue/Components/Translate';
    import MiningClient from '@js/Queue/Client/MiningClient';

    export default {
        components: {Translate, Foldout, Icon},
        data() {
            return {
                items: MiningClient.getItems()
            };
        },

        computed  : {
            tabs() {
                let tabs = {};
                for(let item of this.items) {
                    tabs[item.getId()] = item.getLabel();
                }

                return tabs;
            }
        },

        methods: {
            async save(item) {
                await MiningClient.solveItem(item);
                this.items = MiningClient.getItems();
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