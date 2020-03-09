<template>
    <div class="foldout-container">
        <div v-for="tab in getTabs" :key="tab.id">
            <div class="foldout-tab" :class="{ active: tab.active }">
                <translate :say="tab.label" class="label" @click="setActive(tab.id)" v-if="translate">
                    <icon :icon="tab.icon" :font="tab.iconFont" slot="before" v-if="tab.icon"/>
                </translate>
                <span class="label" @click="setActive(tab.id)" v-else>
                    <icon :icon="tab.icon" :font="tab.iconFont" v-if="tab.icon"/>
                    {{tab.label}}
                </span>
                <slot :name="`${tab.id}-tab-open`" v-if="isActive(tab.id)"/>
                <slot :name="`${tab.id}-tab-closed`" v-if="!isActive(tab.id)"/>
                <slot :name="`${tab.id}-tab`"/>
            </div>
            <div :class="{ active: isActive(tab.id) }" class="foldout-content">
                <keep-alive>
                    <slot :name="tab.id" v-if="isActive(tab.id)"/>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import Translate from '@vue/Components/Translate';
    import Icon from '@vue/Components/Icon';

    export default {
        components: {Icon, Translate},

        props: {
            tabs       : {
                type: Object
            },
            translate  : {
                type   : Boolean,
                default: true
            },
            initialOpen: {
                type   : Boolean,
                default: false
            }
        },

        data() {
            let tab = null;
            if(this.initialOpen) tab = Object.keys(this.tabs)[0];

            return {tab};
        },

        computed: {
            getTabs() {
                let tabs = [];

                for(let id in this.tabs) {
                    if(!this.tabs.hasOwnProperty(id)) continue;
                    let tab = this.tabs[id];
                    if(typeof tab === 'string') tab = {label: tab};
                    if(!tab.hasOwnProperty('icon')) tab.icon = null;
                    if(!tab.hasOwnProperty('iconFont')) tab.iconFont = null;
                    tab.id = id;
                    tab.active = this.isActive(tab.id);

                    tabs.push(tab);
                }

                return tabs;
            }
        },

        methods: {
            isActive(tab) {
                return tab === this.tab;
            },
            setActive(tab) {
                if(!this.initialOpen && this.tab === tab) {
                    this.tab = null;
                    this.$emit('switch', {tab: null});
                    return;
                }

                this.tab = tab;
                this.$emit('switch', {tab});
            }
        },

        watch: {
            tabs(value) {
                if(!value.hasOwnProperty(this.tab)) {
                    if(this.initialOpen) this.tab = Object.keys(value)[0];
                }
            }
        }
    };
</script>

<style lang="scss">
    .foldout-container {
        .foldout-tab {
            cursor           : pointer;
            display          : flex;
            flex-direction   : row;
            overflow         : hidden;
            line-height      : 1rem;
            background-color : var(--element-bg-color);
            color            : var(--element-fg-color);
            box-shadow       : var(--tab-border);
            transition       : var(--element-transition);

            &:hover {
                background-color : var(--element-hover-bg-color);
                color            : var(--element-hover-fg-color);
                box-shadow       : var(--tab-border);
            }

            > * {
                flex-grow   : 0;
                flex-shrink : 0;
            }

            > .label {
                flex-grow     : 1;
                min-width     : 100vw;
                padding       : 1rem;
                transition    : min-width .15s ease-in-out;
                white-space   : nowrap;
                text-overflow : ellipsis;
                overflow      : hidden;

                .icon {
                    margin-right : .5rem;
                }
            }

            .options {
                display : flex;
            }

            &.active,
            &:hover {
                > .label {
                    flex-shrink : 1;
                    min-width   : 50vw;
                }
            }

            &.active {
                background-color : var(--element-active-bg-color);
                color            : var(--element-active-fg-color);
                box-shadow       : var(--tab-active-border);

                &:hover {
                    background-color : var(--element-active-hover-bg-color);
                    color            : var(--element-active-hover-fg-color);
                }
            }

            .option,
            > .icon,
            div .icon {
                padding          : 1rem;
                display          : inline-block;
                background-color : var(--button-bg-color);
                color            : var(--button-fg-color);
                transition       : var(--button-transition);

                &:hover {
                    background-color : var(--button-hover-bg-color);
                    color            : var(--button-hover-fg-color);
                    box-shadow       : var(--tab-button-active-border);
                }
            }

            .option {
                padding : 0;

                .icon {
                    padding    : 1rem;
                    box-shadow : none;

                    &:hover {
                        background-color : transparent;
                        box-shadow       : none;
                    }
                }
            }
        }

        .foldout-content {
            display        : none;
            padding-bottom : 1rem;

            &.active {
                display    : block;
                box-shadow : var(--tab-border);
            }
        }

        > div:last-child {
            .foldout-content.active {
                box-shadow : none;
            }
        }
    }

    body.mobile {
        .foldout-container .foldout-tab {
            > .label {
                flex-shrink : 1;
                min-width   : 50vw;
            }

            .options {
                opacity    : 1;
                transition : none;
            }

            &:hover {
                .options {
                    opacity    : 1;
                    transition : none;
                }
            }
        }
    }
</style>