<template>
    <input :id="id" class="fake-password-input" type="text" :placeholder="placeholder" v-model="realValue" autocomplete="off"/>
</template>

<script>
    export default {
        props: {
            value: {
                type     : String,
                'default': ''
            },
            id   : {
                type     : String,
                'default': ''
            }
        },
        data() {
            return {
                placeholder: ''.padStart(this.value.length, ' '),
                realValue  : ''
            };
        },
        watch: {
            value(value) {
                this.placeholder = ''.padStart(value.length, ' ');
                if(this.realValue !== value) this.realValue = '';
            },
            realValue(realValue) {
                this.$emit('input', realValue);
            }
        }
    };
</script>

<style lang="scss">
    @font-face {
        font-family : "fakepasswordfont";
        src         : url("data:font/woff;base64,d09GMgABAAAAAAT0AAoAAAAAXSQAAASmAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAizQKgYcY6B0LiQwAATYCJAOJCAQgBZIbByAbbUgRxbQh++qAN0RNf0R4GR96WBPG9Qg1qlPt6SdGBMRCl4LnaX//v/bMvoDnfUERQFMCXH8SQwETGR2KfBDcthQf0v+ggt1iyYIN7nZs0GwXYAqLQkx0+/NNOKH/Sqz+5wKH7D/O/TtwT+jBESaFIX0Gm9INlIKlCSM3n9qv5d2TzeDVHl7S1cTs8r/fJUQ0XcTOvKEh0bjpJEsmmawlkEm066RMJRRtiVCi2JabFbe8AEF02HoJ+AkwihzChxoMAIt3zEB3HjRAAYBNkBgCYQCAURMmjmcI7o9fAVAA5A9AUQAHgAEskMUiYD6i5gngcCiwAU+WySq547Ku7pxr5lq5fu5iU7M/+sfvAY5jkqySTS7ril8tfSkf1+B9cMsEk/2X77756pM3evNrVX8FYfWgKCr/pz0gzRAwI0BaQKYV1IYDAG0A8AEgU1U7T9iAplrdCyTMuC3KlOMXcBUAwnsGXGVpKBNM7Jl8ZfOUF9k76bBposIPzd6q6267RuU+HyjTvje8ewC8gDvEbSFCLAxQb8gUAHC+DUnXlM6dHB63Vs5JDPgWRAF43S+NOJr6riOIAUsQV/B9bPnbaByAzmMNwe3tICDNKOADwLCq4WQHQkcZrhCaUYYhwABYOjIcSjuWw0eEI/DTjFMIMIDbCJIXixARKSHMOmmBKBPlKGJ0lK+I09U0lWZoa8afQiBq1mIRDQE9zM4WhBHmCgxx48Ey3cagTLRL4CNvr8DPCPsUAVZpDkE66H6EyOslhPmpjxHlrO+IMd2/DHHm+++WZhgfaJ9GoBhYT1ywnlQND0KJCCL5FtQsgmlBrh4Np1DgNNBSzky0w55xlzXlHCPgQX51QqVE7ZSTZ1NmZ5RRRpmn+X06oGR45pk39B3eneDjcspYnoeBo6E6ZtDhKowgLhgoPN0iyX8WbvrvKvbjYRnXjrPTsxk56nHBo8ZTk2QrPyH7zaq0ykVu1fxbzOOW63GGZteZnOa99hy7LEq5nVNOOeUyEaZE1Naxt5dR6tRxk7r2q20rXEgy3PngZt0TbCEWazQ9PeURGU3z7KLs7Ky0LOOsYFGqfX1eVm0+oDV9xLBhKVdU1PxeuitxuMrH5ft3ewxr42mSEkG9JZ4QKUkkNPmNTO6dBWjE57GNMbWv1yoFwcLwGrDQIgUiRQtAMEbRLSJNeiXvcF50J/KrXotgRvjlYwHp5EfEC/S39JBLZG3GHDPGGGPMvxeI73IgZNorNcig5HXAEODQnROQnqwYFpx0CU2MShHxWUo9ODKoHFOiyPoilSKJDAjWIlEzBmnEWPB44clu8RIs4JtAZaL14tC/54ztHBQURGo0tyArqLs062Dji1d46heIppNGAi7utgapt7GUYHJWr3dWDm5rNBKp2nma/y8SpswGqUAxFqlc5oPP3nvns9RTGXfMGWfczivZ49G6kTYjsGdmDmaL++PtycC1SaWn1WAfkFXSfNZGmrcekciH42PVZkTXAyPBuVJK2XZkM8hK/Z3wjDRJdaUO8W5f0SRwJqVaB2+TMORBtdXGC6Blok3HYAtsut5fSOO3ReeKcGglPVp8991zwPfWCgA=");
    }

    input.fake-password-input {
        font-family    : "fakepasswordfont", "Windings", sans-serif;
        font-size      : 0.5em !important;
        letter-spacing : -0.75em !important;
    }
</style>