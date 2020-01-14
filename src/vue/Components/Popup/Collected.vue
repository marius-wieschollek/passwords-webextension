<template>
    <div class="collected-container">
        <password v-for="item of items" :key="item.getId()" :password="item.getPassword()"></password>
        <translate tag="div" class="no-results" say="NoCollectedPasswords" v-if="items.length === 0"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import MiningClient from '@js/Queue/Client/MiningClient';
    import Password from '@vue/Components/List/Item/Password';

    export default {
        components: {Password, Translate},
        data() {
            return {
                items: MiningClient.getItems()
            };
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