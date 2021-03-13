<template>
    <ul class="list password-list">
        <password v-for="password in passwords" :password="password" :key="password.getId()" :favicon="favicons" :menu="menus" v-on:delete="$emit('delete', $event)"/>
    </ul>
</template>

<script>
    import Password from '@vue/Components/List/Item/Password';

    export default {
        components: {Password},
        props     : {
            passwords: {
                type   : Array,
                default: []
            },
            favicons : {
                type   : Boolean,
                default: false
            },
            menus    : {
                type   : Boolean,
                default: true
            }
        }
    };
</script>

<style lang="scss">
.list.password-list {
    list-style : none;
    padding    : 0;
    margin     : 0;
}
</style>