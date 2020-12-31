<template>
    <div class="mining-item">
        <translate say="MiningItemIsNew" class="create-info" v-if="item.isNew()">
            <icon slot="before" icon="info-circle" font="solid"/>
        </translate>
        <translate say="MiningItemIsUpdate" class="create-info" :variables="updateVariables" v-else>
            <icon slot="before" icon="info-circle" font="solid"/>
        </translate>
        <mined-property :field="field" :item="item" v-for="field in fields" :key="field"/>
    </div>
</template>

<script>
    import MiningItem from '@js/Models/Queue/MiningItem';
    import MinedProperty from '@vue/Components/Collected/MinedProperty';
    import Translate from '@vue/Components/Translate';
    import Icon from '@vue/Components/Icon';

    export default {
        components: {Icon, Translate, MinedProperty},
        props     : {
            item: {
                type: MiningItem
            }
        },
        computed  : {
            updateVariables() {
                return [
                    this.item.getTask().fields.label
                ];
            },
            fields() {
                let resultFields = this.item.listResultFields(),
                    fields       = [];

                for(let resultField of resultFields) {
                    if(resultField !== 'id') fields.push(resultField);
                }

                return fields;
            }
        }
    };
</script>

<style lang="scss">
.mining-item {
    .create-info {
        display : block;
        padding : 1rem .5rem .25rem .5rem;
        color   : var(--element-active-fg-color);
    }
}
</style>