import packageJson from '../package.json' with {type: 'json'};
import parseChangelog from "changelog-parser";
import fs from 'fs';
import path from 'path';

async function getChangelog() {
    let changelog      = await parseChangelog('./Changelog.md'),
        version        = packageJson.version,
        unreleasedText = '';

    for(let item of changelog.versions) {
        if(item.version === version) {
            return item.body;
        }
        if(!item.version && !unreleasedText) {
            unreleasedText = item.body;
        }
    }

    return unreleasedText;
}

function getApprovalNotes() {
    let approvalNotesText = path.resolve(`firefox/approval_notes.md`);

    return fs.readFileSync(approvalNotesText, {encoding: 'utf8', flag: 'r'});
}

async function main() {
    let changelog      = await getChangelog(),
        approval_notes = getApprovalNotes(),
        release_notes  = {"en-US": changelog};

    let filePath = path.resolve(`metadata.json`),
        data     = {version: {release_notes, approval_notes}};
    fs.writeFileSync(filePath, JSON.stringify(data));
}

await main();