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
            this.loadIcon();
        },

        computed: {
            style() {
                return {
                    backgroundColor: this.theme.getBadgeBackgroundColor(),
                    color          : this.theme.getBadgeForegroundColor()
                };
            }
        },

        methods: {
            loadIcon() {
                let icon = this.theme.getBadgeIcon();
                if(icon === null) icon = 'passwords';

                SystemService.getFileUrl(`/img/${icon}.svg`)
                    .then((r) => {this.icon = r;})
                    .catch(ErrorManager.catch);
            }
        },

        watch: {
            theme: {
                deep: true,
                handler() {
                    this.loadIcon();
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
            box-sizing    : border-box;
            width         : 40px;
            height        : 40px;
            margin        : .5rem auto;
            position      : relative;

            img {
                width  : 24px;
                height : 24px;
                margin : 7px;
            }

            .badge {
                position      : absolute;
                width         : 1.1rem;
                height        : 1.1rem;
                font-size     : .75rem;
                line-height   : 1.1rem;
                text-align    : center;
                border-radius : 3px;
                right         : -.45rem;
                top           : -.45rem;
                font-family   : Verdana, sans-serif;

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
    body.mobile {
        .theme-preview {
            .popup-preview {
                height        : 360px;
                width         : 100vw;
                border-radius : 0;
                border-width: 1px 0;
            }
        }
    }
</style>