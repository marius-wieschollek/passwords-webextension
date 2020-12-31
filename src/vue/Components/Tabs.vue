<template>
    <div class="tab-container">
        <div class="tabs">
            <div :key="name"
                 v-for="(tab, name) in tabs"
                 @click="setActive(name)"
                 :class="`tab-label-${name} ${isActive(name) ? 'active':''}`"
                 class="tab">
                <div>
                    <icon :icon="tab.icon" class="icon" v-if="tab.icon" font="solid"/>
                    <translate :say="tab.label" class="label" v-if="tab.label"/>
                </div>
            </div>
        </div>
        <div class="tab-content">
            <div v-for="(meta, name) in tabs"
                 :key="name"
                 :class="`tab-content-${name}`"
                 :style="{display: name===tab ? 'block':'none'}">
                <keep-alive>
                    <slot :name="name" v-if="name===tab"/>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import Icon from '@vue/Components/Icon';
    import Translate from '@vue/Components/Translate';

    export default {
        components: {Icon, Translate},

        props: {
            tabs      : {
                type: Object
            },
            initialTab: {
                type   : String,
                default: null
            }
        },

        data() {
            let tab = this.initialTab === null ? Object.keys(this.tabs)[0]:this.initialTab;

            return {tab};
        },

        methods: {
            isActive(tab) {
                return tab === this.tab;
            },
            setActive(tab) {
                if(typeof this.tabs[tab] !== 'string' && this.tabs[tab].action) {
                    this.tabs[tab].action();
                    return;
                }
                this.tab = tab;
                this.$emit('switch', {tab});
            }
        },

        watch: {
            tabs(value) {
                if(!value.hasOwnProperty(this.tab)) {
                    this.tab = Object.keys(value)[0];
                }
            }
        }
    };
</script>

<style lang="scss">
.tab-container {
    .tabs {
        display         : flex;
        overflow        : hidden;
        overflow-x      : auto;
        scrollbar-width : none;
    }

    .tab {
        padding          : 1rem;
        cursor           : pointer;
        flex             : 1 1 auto;
        text-align       : center;
        display          : flex;
        background-color : var(--element-bg-color);
        color            : var(--element-fg-color);
        box-shadow       : var(--tab-border);
        white-space      : nowrap;
        transition       : var(--element-transition);

        &:hover {
            background-color : var(--element-hover-bg-color);
            color            : var(--element-hover-fg-color);
            box-shadow       : var(--tab-border);
            transition       : var(--element-transition);
        }

        .icon {
            width        : 1rem;
            height       : 1rem;
            margin-right : .5rem;
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
    }
}
</style>