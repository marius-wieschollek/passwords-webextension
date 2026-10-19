import {EdgeAddonsAPI} from '@plasmohq/edge-addons-api';
import json            from '../dist/chrome-extension/manifest.json' with {type: 'json'};

if(!process.env.EDGE_PRODUCT_ID || !process.env.EDGE_CLIENT_ID || !process.env.EDGE_API_KEY) {
    throw new Error('Could not find environment variables');
}

const client = new EdgeAddonsAPI(
    {
        productId     : process.env.EDGE_PRODUCT_ID,
        clientId      : process.env.EDGE_CLIENT_ID,
        apiKey        : process.env.EDGE_API_KEY,
    }
);

let response = await client.submit(
    {
        filePath: './edge-extension.zip',
        // The notes are inserted unescaped into the request body, so they must not contain double quotes or line breaks
        notes   : [
            `Passwords for Nextcloud Browser Extension ${json.version}.`,
            `A test server is provided at https://test.passwordsapp.org/info.html.`,
            `Log in with the 'edge' account and listed password.`,
            `After login, navigate to https://test.passwordsapp.org/apps/passwords/#/apps or click on the puzzle icon on the bottom left.`,
            `Click on 'Connect with PassLink' in the 'Edge Extension' listing.`,
            `Click on 'Connect via Link' in the popup and confirm the codes with 'Looks good' to finish the account setup.`,
            `Once the data has been fetched from the server, you can see the credentials in the extension popup.`,
            `The first tab has recommended credentials for the current tab, the second lets you search credentials and the third lets you see the server data.`,
            `Clicking a credential will paste it into the current tab (if possible). Please note that all credentials are demo only and do not actually work.`
        ].join(' ')
    }
);

console.log('Update pushed', response);