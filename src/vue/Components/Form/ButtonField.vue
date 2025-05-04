<template>
    <button :type="getType" :title="getTitle" v-on="$listeners" :class="buttonClass">
        <slot name="before"/>
        {{ getValue }}
        <slot name="default"/>
        <slot name="after"/>
    </button>
</template>

<script>
    import LocalisationService from '@js/Services/LocalisationService';

    export default {

        props: {
            value    : {
                type   : String,
                default: ''
            },
            title    : {
                type   : String,
                default: ''
            },
            type     : {
                type   : String,
                default: 'button'
            },
            variant  : {
                type: String
            },
            wide     : {
                type   : Boolean,
                default: false
            },
            alignment: {
                type: String
            }
        },

        computed: {
            getTitle() {
                if(this.title.length === 0) return;

                return LocalisationService.translate(this.title);
            },
            getValue() {
                if(this.value.length === 0) return;

                return LocalisationService.translate(this.value);
            },
            getType() {
                return this.type === 'submit' ? 'submit':'button';
            },
            buttonClass() {
                let className = '';
                if(this.variant) {
                    className = `input-button button-${this.variant}`;

                    if(this.wide) {
                        className += ' button-wide';
                    }
                    if(this.alignment) {
                        className += ` alignment-${this.alignment}`;
                    }
                }

                return className;
            }
        }
    };
</script>

<style lang="scss">
.input-button {
    &.button-wide {
        width : 100%;
    }

    &.alignment-left {
        text-align : left;
    }

    &.alignment-center {
        text-align : center;

        .icon {
            margin-left : 0;
        }
    }

    &.alignment-right {

        .icon {
            margin-left : 0;
        }
    }

    &.button-secondary {
        background-color : var(--element-active-bg-color);
        color            : var(--element-active-fg-color);
        line-height      : 3rem;
        border-radius    : var(--button-border-radius);
        border           : none;
        margin           : .5rem;
        cursor           : pointer;

        &:hover {
            background-color : var(--element-active-hover-bg-color);
            color            : var(--element-active-hover-fg-color);
        }

        .icon {
            margin-left  : .5rem;
            margin-right : .5rem;
        }
    }
}
</style>