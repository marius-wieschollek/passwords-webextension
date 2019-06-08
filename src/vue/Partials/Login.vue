<template>
    <div class="login theme-hover-invert target" @click="insertPassword">
        <div class="title" :title="login.title">
            <span :class="{overflow: overflow}">{{login.title}}</span>
        </div>
        <div class="options">
            <i class="fa fa-user target"
               @click="copyUser"
               @mouseover="switchIcon($event, 'user')"
               @mouseout="switchIcon($event, 'user')" v-if="login.user"></i>
            <i class="fa fa-key target"
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
            login    : {
                type: Object
            },
            autoclose: {
                type     : Boolean,
                'default': false
            }
        },

        data() {
            return {
                overflow: false
            }
        },

        mounted() {
            this.overflow = this.$el.querySelector('.title > span').offsetWidth > document.body.offsetWidth
        },
        updated() {
            this.overflow = this.$el.querySelector('.title > span').offsetWidth > document.body.offsetWidth
        },

        methods: {
            insertPassword($e) {
                $e.stopPropagation();
                $e.preventDefault();

                browser.tabs.query({currentWindow: true, active: true})
                    .then((tabs) => {
                        browser.tabs.sendMessage(tabs[0].id, this.login)
                            .then(() => {
                                this.playAnimation($e, 'success')
                                    .then(() => { if (this.autoclose) window.close(); });
                            })
                            .catch((e) => {this.playAnimation($e, 'error');});
                    });
            },
            copyPassword($e) {
                $e.stopPropagation();
                Utility.copyToClipboard(this.login.password);
                this.playAnimation($e, 'success');
            },
            copyUser($e) {
                $e.stopPropagation();
                Utility.copyToClipboard(this.login.user);
                this.playAnimation($e, 'success');
            },
            switchIcon($e, cName) {
                $($e.target)
                    .toggleClass('fa-clipboard')
                    .toggleClass('fa-' + cName)
            },
            playAnimation($e, type) {
                return new Promise((resolve, reject) => {
                    let $target = $($e.target);

                    if(!$target.hasClass('target')) {
                        $target = $target.parents('.target').eq(0);
                    }

                    $target.addClass(type).on(
                        'animationend',
                        () => {
                            $target.removeClass(type);
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
        padding       : 0 10px;
        line-height   : 38px;
        height: 38px;
        text-align    : center;
        cursor        : pointer;
        max-width     : 100%;
        text-overflow : ellipsis;
        box-sizing    : border-box;
        overflow      : hidden;
        position      : relative;
        transition    : padding 0.2s ease-in-out, background-color 0.2s ease-in-out, color 0.2s ease-in-out;

        .title {
            display: inline;

            span {
                white-space: nowrap;
                position: relative;

                &.overflow:hover {
                    animation: horizontally 5s linear infinite alternate;
                }
            }
        }

        .options {
            position   : absolute;
            right      : 0;
            top        : 0;
            opacity    : 0;
            font-size  : 0;
            transition : opacity 0.2s ease-in-out;

            .fa {
                font-size   : 12pt;
                display     : inline-block;
                padding     : 0 10px;
                min-width   : 38px;
                line-height : 38px;
                text-align  : center;
                box-sizing  : border-box;

                &.success {
                    animation : blink-success 0.75s 2;
                }

                &.error {
                    animation : blink-error 0.75s 2;
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
            animation : blink-success 1s 2;
        }

        &.error {
            animation : blink-error 1s 2;
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

    @keyframes horizontally {
        0%   {
            left: 0;
        }
        100% {
            left: -110%;
        }
    }
</style>