<template>
    <div class="passlink-scan-qr">
        <translate class="scan-instructions" say="PasslinkScanInstructions"/>
        <qrcode-stream :torch="false" class="qr-code-scanner" @decode="checkQrCode" @init="onInit"/>
        <translate class="scan-status" :say="status"/>
    </div>
</template>

<script>
    import {QrcodeStream} from 'vue-qrcode-reader';
    import Translate from '@vue/Components/Translate';
    import Passlink from '@js/App/Passlink';
    import ErrorManager from '@js/Manager/ErrorManager';

    export default {
        components: {Translate, QrcodeStream},

        data() {
            return {
                status: 'PasslinkScanScanning'
            };
        },

        methods: {
            checkQrCode(data) {
                if(data.match(/^(ext\+)?passlink:.+\/do\/connect[\/?].+$/)) {
                    this.status = 'PasslinkScanProcessingLink';
                    Passlink
                        .loadLink(data)
                        .catch(ErrorManager.catch);
                } else {
                    this.status = 'PasslinkScanInvalidQrCode';
                }
            },
            async onInit(promise) {
                try {
                    await promise;
                } catch(error) {
                    ErrorManager.logError(error);
                    this.status = `Qr${error.name}`;
                }
            }
        }
    };
</script>

<style lang="scss">
.passlink-scan-qr {
    .qr-code-scanner {
        max-width  : 640px;
        max-height : 640px;
        width      : 90vw;
        height     : 90vw;
        margin     : 0 auto;
    }

    .scan-status,
    .scan-instructions {
        max-width   : 640px;
        width       : 90vw;
        margin      : 1rem auto;
        font-weight : bold;
        text-align  : center;
        display     : block;
    }

    .scan-status {
        margin      : 1rem auto;
        font-weight : normal;
    }
}

body.mobile {
    .passlink-scan-qr {
        display        : flex;
        flex-direction : column;
        height         : 100vh;

        .qr-code-scanner {
            flex-grow : 1;
        }
    }
}
</style>