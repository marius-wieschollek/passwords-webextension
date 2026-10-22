import {readFile} from 'node:fs/promises';
import json       from '../dist/chrome-extension/manifest.json' with {type: 'json'};

// https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/addons-api-reference
const API_URL = 'https://api.addons.microsoftedge.microsoft.com/v1';

if(!process.env.EDGE_PRODUCT_ID || !process.env.EDGE_CLIENT_ID || !process.env.EDGE_API_KEY) {
    throw new Error('Could not find environment variables');
}

const productUrl = `${API_URL}/products/${encodeURIComponent(process.env.EDGE_PRODUCT_ID)}/submissions`;
const notes = [
    `Passwords for Nextcloud Browser Extension ${json.version}.`,
    `A test server is provided at https://test.passwordsapp.org/info.html.`,
    `Log in with the 'edge' account and listed password.`,
    `After login, navigate to https://test.passwordsapp.org/apps/passwords/#/apps or click on the puzzle icon on the bottom left.`,
    `Click on 'Connect with PassLink' in the 'Edge Extension' listing.`,
    `Click on 'Connect via Link' in the popup and confirm the codes with 'Looks good' to finish the account setup.`,
    `Once the data has been fetched from the server, you can see the credentials in the extension popup.`,
    `The first tab has recommended credentials for the current tab, the second lets you search credentials and the third lets you see the server data.`,
    `Clicking a credential will paste it into the current tab (if possible). Please note that all credentials are demo only and do not actually work.`
].join(' ');

class EdgeApiError extends Error {}

async function request(method, url, body, contentType) {
    let headers = {
        Authorization : `ApiKey ${process.env.EDGE_API_KEY}`,
        'X-ClientID'  : process.env.EDGE_CLIENT_ID
    };
    if(contentType) headers['Content-Type'] = contentType;

    let response = await fetch(url, {method, headers, body});
    if(!response.ok) {
        let text = await response.text();
        throw new EdgeApiError(`${method} ${new URL(url).pathname} failed with ${response.status} ${response.statusText}: ${text}`);
    }

    return response;
}

async function waitForOperation(url, label, attempts = 20, delay = 5000) {
    for(let i = 0; i < attempts; i++) {
        let operation = await (await request('GET', url)).json();

        if(operation.status === 'Succeeded') {
            console.log(`${label} succeeded: ${operation.message}`);
            return operation;
        }
        if(operation.status === 'Failed') {
            throw new EdgeApiError(`${label} failed: ${JSON.stringify(operation, null, 2)}`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new EdgeApiError(`${label} did not finish after ${attempts} checks`);
}

try {
    let upload = await request('POST', `${productUrl}/draft/package`, await readFile('./edge-extension.zip'), 'application/zip');
    await waitForOperation(`${productUrl}/draft/package/operations/${upload.headers.get('Location')}`, 'Upload');

    let publish = await request('POST', productUrl, JSON.stringify({notes}), 'application/json');
    await waitForOperation(`${productUrl}/operations/${publish.headers.get('Location')}`, 'Publish');
} catch(e) {
    // Only print our own message, never the request with its auth headers
    console.error(e instanceof EdgeApiError ? e.message:`Edge publish failed: ${e.message}`);
    process.exit(1);
}
