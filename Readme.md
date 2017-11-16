This WebExtension is a client for the [Passwords app for Nextcloud](https://github.com/marius-wieschollek/passwords-legacy).

### Development
##### Project Setup
1. Run `npm install`
2. Run `npm run watch`

##### Firefox Setup
1. Open "about:debugging" in Firefox
2. Click "Load Temporary Add-on"
3. Select the manifest.json in the "dist" folder

##### Notes for AMO reviewers
1. This extension uses Vue.js, jQuery, UglifyJS and webpack