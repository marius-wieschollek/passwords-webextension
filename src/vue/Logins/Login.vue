<template>
    <div class="login" @click="insertPassword">
        {{login.user}}
        <div class="options">
            <i class="fa fa-user"
               @click="copyUser"
               @mouseover="switchIcon($event, 'user')"
               @mouseout="switchIcon($event, 'user')"></i>
            <i class="fa fa-key"
               @click="copyPassword"
               @mouseover="switchIcon($event, 'key')"
               @mouseout="switchIcon($event, 'key')"></i>
        </div>
    </div>
</template>

<script>
    import $ from "jquery";
    import Utility from "@js/Classes/Utility";

    export default {
        props: {
            login: {
                type: Object
            }
        },

        components: {},

        methods: {
            insertPassword($e) {
                $e.stopPropagation();
                browser.tabs.query({currentWindow: true, active: true})
                    .then((tabs) => {
                        //let port = browser.tabs.connect(tabs[0].id, {name: 'password-inject'});
                        browser.tabs.sendMessage(tabs[0].id, this.login);
                    });
            },
            copyPassword($e) {
                $e.stopPropagation();
                Utility.copyToClipboard(this.login.password);
            },
            copyUser($e) {
                $e.stopPropagation();
                Utility.copyToClipboard(this.login.user);
            },
            switchIcon($e, cName) {
                $($e.target)
                    .toggleClass('fa-clipboard')
                    .toggleClass('fa-' + cName)
            }
        }
    }
</script>

<style lang="scss">
    .login {
        display       : block;
        padding       : 5px;
        text-align    : center;
        cursor        : pointer;
        max-width     : 250px;
        text-overflow : ellipsis;
        box-sizing    : border-box;
        overflow      : hidden;
        position      : relative;

        .options {
            background-color : #0082c9;
            position         : absolute;
            right            : 0;
            top              : 0;
            display          : none;

            .fa {
                display : inline-block;
                padding : 5px;
            }
        }

        &:hover {
            background-color : #0082c9;
            color            : #fff;

            .options {
                display : block;
            }
        }
    }
</style>