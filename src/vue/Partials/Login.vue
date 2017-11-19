<template>
    <div class="login theme-hover-invert" @click="insertPassword">
        {{login.title}}
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

        methods: {
            insertPassword($e) {
                $e.stopPropagation();
                browser.tabs.query({currentWindow: true, active: true})
                    .then((tabs) => {
                        browser.tabs.sendMessage(tabs[0].id, this.login);
                        this.playAnimation($e).then(() => {
                            window.close();
                        });
                    });
            },
            copyPassword($e) {
                $e.stopPropagation();
                Utility.copyToClipboard(this.login.password);
                this.playAnimation($e);
            },
            copyUser($e) {
                $e.stopPropagation();
                Utility.copyToClipboard(this.login.user);
                this.playAnimation($e);
            },
            switchIcon($e, cName) {
                $($e.target)
                    .toggleClass('fa-clipboard')
                    .toggleClass('fa-' + cName)
            },
            playAnimation($e) {
                return new Promise((resolve, reject) => {
                    let $target = $($e.target);
                    $target.addClass('success').on(
                        'animationend',
                        () => {
                            $target.removeClass('success');
                            resolve();
                        }
                    );
                })
            }
        }
    }
</script>

<style lang="scss">
    .login {
        display       : block;
        padding       : 10px;
        text-align    : center;
        cursor        : pointer;
        max-width     : 100%;
        text-overflow : ellipsis;
        box-sizing    : border-box;
        overflow      : hidden;
        position      : relative;
        transition    : padding 0.2s ease-in-out, background-color 0.2s ease-in-out, color 0.2s ease-in-out;

        .options {
            position   : absolute;
            right      : 0;
            top        : 0;
            opacity    : 0;
            font-size  : 0;
            transition : opacity 0.2s ease-in-out;

            .fa {
                font-size  : 12pt;
                display    : inline-block;
                padding    : 11px;
                min-width  : 38px;
                text-align : center;

                &.success {
                    animation : blink-success 1s 3;
                }
            }
        }

        &:hover {
            padding-right : 80px;

            .options {
                opacity : 1;
            }
        }

        &.success {
            animation : blink-success 1s 3;
        }
    }

    body.mobile {
        .login {
            padding-right : 80px;

            .options {
                opacity : 1;
            }
        }
    }
</style>