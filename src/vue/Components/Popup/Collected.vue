<template>
    <div class="collected-container">
        <translate tag="div" class="no-results" say="NoCollectedPasswords" v-if="passwords.length === 0"/>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Translate},
        data() {
            return {
                passwords: []
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