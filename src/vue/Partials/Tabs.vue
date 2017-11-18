<template>
    <div class="tab-container" :data-tab-uuid="uuid">
        <ul class="tab-titles theme">
            <li
                    class="fa tab-title"
                    v-for="(tab, name) in tabs"
                    :key="name"
                    :class="tabClass(name, tab)"
                    @click="setCurrentTab(name)"
            ></li>
        </ul>
        <div class="tab-contents">
            <div v-for="(tab, name) in tabs" :data-tab="name" class="tab-content" v-bind:class="{ active: isCurrentTab(name) }">
                <slot :name="name"></slot>
            </div>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Partials/Translate.vue';

    export default {
        components: {
            Translate
        },

        props: {
            tabs   : {
                type: Object
            },
            uuid   : {
                type: String
            },
            current: {
                type     : String,
                'default': '',
            }
        },

        data() {
            return {
                tab: this.current ? this.current:Object.keys(this.tabs)[0]
            }
        },

        methods: {
            isCurrentTab(tab) {
                return tab === this.tab
            },
            setCurrentTab(tab) {
                this.tab = tab;
            },
            tabClass(name, tab) {
                return (this.isCurrentTab(name) ? 'active theme-invert ':'theme-on-hover-invert ') + 'fa-' + tab
            },
            updateCurrentAttribute() {
                if(this.current) {
                    this.tab = this.current
                }
            }
        },
        watch  : {
            uuid: function () {
                this.updateCurrentAttribute();
            },
            current: function () {
                this.updateCurrentAttribute();
            }
        }
    }
</script>

<style lang="scss">
    .tab-container {
        .tab-titles {
            display : flex;
            padding : 0;
            margin  : 0;

            .tab-title {
                display    : block;
                flex-grow  : 1;
                padding    : 10px 5px;
                cursor     : pointer;
                text-align : center;
            }
        }

        .tab-contents {
            display : block;

            .tab-content {
                display : none;

                &.active {
                    display : block;
                }
            }
        }
    }
</style>