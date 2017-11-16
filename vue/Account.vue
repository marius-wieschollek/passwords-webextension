<template>
    <div class="account-entry" @click="insertPassword">
        {{account.user}}
    </div>
</template>

<script>
    import Utility from "@js/Classes/Utility";

    export default {

        props: {
            account: {
                type: Object
            }
        },

        components: {
        },

        methods: {
            insertPassword() {
                Utility.copyToClipboard(this.account.password);
            }
        }
    }
</script>

<style lang="scss">
    .account-entry {
        display: block;
        padding: 5px;
        text-align: center;
        cursor: pointer;
        max-width: 250px;
        text-overflow: ellipsis;
        box-sizing: border-box;
        overflow: hidden;


        &:hover{
            background-color: #0082c9;
            color: #fff;
        }
    }
</style>