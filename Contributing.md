### Development requirements
A running Nextcloud instance with the passwords app installed.
You can find instructions to set up a test server in the [main project](https://github.com/marius-wieschollek/passwords)
Firefox and Chromium are required.
_Using a test account is recommended_



### Installing from source
##### Project Setup
1. Run `npm install` from the command line

##### For Firefox
1. Run `npm run watch:firefox`
2. Open "about:debugging" in Firefox
3. Click "Load Temporary Add-on"
4. Select the manifest.json in the "dist" folder in the file popup.

##### For Chromium
1. Run `npm run watch:chrome`
2. Open "chrome://extensions/" in Chromium
3. Enable "Developer Mode"
4. Click "Load unpacked extension"
5. Select the "dist" folder in the file popup



### Debugging
##### In Firefox
1. Open "about:debugging"
2. Enable "Activate debugging of extensions"
3. Scroll to "Passwords for Nextcloud Client" and click on "Debug"
4. Confirm the debugging request

##### In Chromium
1. Open "chrome://extensions/"
2. Scroll to "Passwords for Nextcloud Client" and click on "Background Page" or "Errors"



### Packing
##### Build on Firefox
1. Run `npm build`
2. Pack the contents of the "dist" folder to a .zip file
3. Rename the file to "ncpasswords@mdns.eu.xpi"

##### Build on Chromium
1. Run `npm build-chrome`
2. Open "chrome://extensions/" in Chromium 
3. Enable "Developer mode"
4. Click "Pack extension"
5. Select the "dist" folder in the file popup
6. If you have a private key file, select it as well
7. Click on "Pack extension"



### Debug API/Connection issues
1. Follow the steps in [Debugging](#debugging) for your browser
2. Execute the synchronisation action in the extension interface
3. Network activity should appear in the "Network" tab
4. Failed requests should be logged in the "Console"



### Tasks for starters
You can always help translating the app.
The translation files can be found in `src/platform/generic/_locales/<language>`.
Use the english language for reference.