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
        notes   : `Passwords for Nextcloud Browser Extension ${json.version}`
    }
);

console.log('Update pushed', response);