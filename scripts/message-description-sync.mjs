import LanguageTags from '../src/platform/generic/_locales/en/messages.json';
import LanguageTagsBg from '../src/platform/generic/_locales/bg/messages.json';
import LanguageTagsCs from '../src/platform/generic/_locales/cs/messages.json';
import LanguageTagsDe from '../src/platform/generic/_locales/de/messages.json';
import LanguageTagsEs from '../src/platform/generic/_locales/es/messages.json';
import LanguageTagsFr from '../src/platform/generic/_locales/fr/messages.json';
import LanguageTagsIt from '../src/platform/generic/_locales/it/messages.json';
import LanguageTagsPl from '../src/platform/generic/_locales/pl/messages.json';
import LanguageTagsRu from '../src/platform/generic/_locales/ru/messages.json';
import LanguageTagsTr from '../src/platform/generic/_locales/tr/messages.json';
import fs from 'fs';
import path from 'path';


let languages = {
        bg: LanguageTagsBg,
        cs: LanguageTagsCs,
        de: LanguageTagsDe,
        es: LanguageTagsEs,
        fr: LanguageTagsFr,
        it: LanguageTagsIt,
        pl: LanguageTagsPl,
        ru: LanguageTagsRu,
        tr: LanguageTagsTr
    },
    changes   = {};

for(let tag in LanguageTags) {
    if(!LanguageTags.hasOwnProperty(tag)) continue;
    let languageTag = LanguageTags[tag];
    if(!languageTag.hasOwnProperty('description') || languageTag.description.length === 0) continue;

    for(let language in languages) {
        if(!languages.hasOwnProperty(language)) continue;
        if(!languages[language].hasOwnProperty(tag)) continue;
        let translation = languages[language][tag];

        if(!translation.hasOwnProperty('description') || translation.description.length === 0 || translation.description !== languageTag.description) {
            translation.description = languageTag.description;
            changes[language] = true;
        }

        if(languageTag.hasOwnProperty('placeholders') && (translation.hasOwnProperty('placeholders') || JSON.stringify(languageTag.placeholders) !== JSON.stringify(translation.placeholders))) {
            translation.placeholders = languageTag.placeholders;
            changes[language] = true;
        }
    }
}

for(let language in changes) {
    if(!changes.hasOwnProperty(language) || !languages.hasOwnProperty(language)) continue;

    let data = JSON.stringify(languages[language], null, 4),
        file = path.resolve(`src/platform/generic/_locales/${language}/messages.json`);
    fs.writeFileSync(file, data);
}