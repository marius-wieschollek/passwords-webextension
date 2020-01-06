<template>
    <div class="tab-container">
        <div class="tabs">
            <div :key="name"
                 v-for="(tab, name) in tabs"
                 @click="setActive(name)"
                 :class="{ active: isActive(name) }"
                 class="tab">
                <icon :icon="tab.icon" class="icon" v-if="tab.icon" font="solid"/>
                <translate :say="tab.label" class="label" v-if="tab.label"/>
            </div>
        </div>
        <div class="tab-content">
            <slot :name="tab"/>
        </div>
    </div>
</template>

<script>
    import Icon from "@vue/Components/Icon";
    import Translate from "@vue/Components/Translate";

    export default {
        components: {Icon, Translate},

        props: {
            tabs: {
                type: Object
            }
        },

        data() {
            return {
                tab: Object.keys(this.tabs)[0]
            }
        },

        methods: {
            isActive(tab) {
                return tab === this.tab
            },
            setActive(tab) {
                if(typeof this.tabs[tab] !== "string" && this.tabs[tab].action) {
                    this.tabs[tab].action();
                    return;
                }
                this.tab = tab;
            }
        },

        computed: {
            tabList() {
                let tabs = {};

                for(let key in this.tabs) {
                    if(!this.tabs.hasOwnProperty(key)) continue;
                    let tab = this.tabs[key];

                    if(typeof tab === "string") {
                        tabs[key] = {
                            icon : null,
                            label: tab
                        }
                    } else {
                        tabs[key] = {
                            icon : tab.icon ? tab.icon:null,
                            label: tab.label ? tab.label:null
                        };
                    }
                }

                return tabs;
            }
        },

        watch: {
            tabs(value) {
                if(!value.hasOwnProperty(this.tab)) {
                    this.tab = Object.keys(value)[0]
                }
            }
        }
    }
</script>

<style lang="scss">
    .tab-container {
        .tabs {
            display : flex;
        }

        .tab {
            padding          : 1rem;
            cursor           : pointer;
            flex             : 1 1 auto;
            text-align       : center;
            display          : flex;
            background-color : var(--content-secondary-background-color);
            color            : var(--content-secondary-text-color);
            box-shadow       : 0 -1px 0 var(--content-secondary-border-color) inset;
            white-space: nowrap;

            &:hover {
                background-color : var(--content-secondary-hover-background-color);
                color            : var(--content-secondary-hover-text-color);
                box-shadow       : 0 -1px 0 var(--content-secondary-hover-border-color) inset;
            }

            .icon {
                width        : 1rem;
                height       : 1rem;
                margin-right : .5rem;
            }

            &.active {
                background-color : var(--content-primary-background-color);
                color            : var(--content-primary-text-color);
                box-shadow       : 0 -1px 0 var(--content-primary-hover-border-color) inset, 0 -4px 0 var(--content-primary-border-color) inset;

                &:hover {
                    background-color : var(--content-primary-hover-background-color);
                    color            : var(--content-primary-hover-text-color);
                }

                .icon svg {
                    fill : var(--content-primary-text-color);
                }
            }
        }
    }
</style>