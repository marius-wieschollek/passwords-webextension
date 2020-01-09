<template>
    <div id="authorisation">
        <img src="" alt="">
        <h2>{{authRequest.getServerId()}}</h2>
        <div v-if="authRequest.requiresPassword()">
            <input type="password" id="password" v-model="password">
        </div>
        <input type="submit" value="Login" @click="submit"/>
        <span>{{state}}</span>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Popup from '@js/App/Popup';

    export default {
        components: {Translate},
        data() {
            let current = Popup.AuthorisationClient.getCurrent();
            return {
                authRequest: current,
                password: null,
                state: 'waiting'
            }
        },
        methods: {
            async submit() {
                let current = Popup.AuthorisationClient.getCurrent();
                current.setPassword(this.password);

                try {
                    current = await Popup.AuthorisationClient.solveCurrent();
                    this.state = 'success';
                } catch(e) {
                    this.state = 'failed';
                }
            }
        }
    };
</script>

<style lang="scss">
    #authorisation {

    }
</style>