<template>
    <div class="theme-preview">
        <div class="badge-preview">
            <img :src="icon" alt=""/>
            <div class="badge" :style="style">8</div>
        </div>
        <iframe :src="url" class="popup-preview"/>
    </div>
</template>

<script>
    import Theme from '@js/Models/Theme/Theme';
    import SystemService from '@js/Services/SystemService';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        props: {
            theme: Theme
        },

        data() {
            return {
                url : 'about:blank',
                icon: null
            };
        },

        mounted() {
            this.url = 'preview.html';
            SystemService.getFileUrl(`/img/${this.theme.getBadgeIcon()}.svg`)
                .then((r) => {this.icon = r;})
                .catch(ErrorManager.catch);
        },

        computed: {
            style() {
                return {
                    backgroundColor: this.theme.getBadgeBackgroundColor(),
                    color          : this.theme.getBadgeForegroundColor()
                };
            }
        },

        watch: {
            theme: {
                deep: true,
                handler(theme) {
                    SystemService.getFileUrl(`/img/${theme.getBadgeIcon()}.svg`)
                        .then((r) => {this.icon = r;})
                        .catch(ErrorManager.catch);
                }
            }
        }
    };
</script>

<style lang="scss">
    .theme-preview {
        .badge-preview {
            border        : 1px solid var(--element-hover-bg-color);
            border-radius : 5px;
            width         : 40px;
            height        : 40px;
            margin        : .5rem auto;
            padding       : 7px;
            position      : relative;

            img {
                width  : 24px;
                height : 24px;
            }

            .badge {
                position      : absolute;
                width         : 1rem;
                height        : 1rem;
                font-size     : .8rem;
                line-height   : 1rem;
                text-align    : center;
                border-radius : 3px;
                right         : -.4rem;
                top           : -.4rem;

                &.bottom {
                    top    : auto;
                    bottom : -.4rem;
                }
            }
        }

        .popup-preview {
            height        : 360px;
            border        : 1px solid var(--element-hover-bg-color);
            width         : 100%;
            border-radius : 5px;
        }
    }
</style>