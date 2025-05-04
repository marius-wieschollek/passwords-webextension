## Test server
A test server is provided at [test.passwordsapp.org](https://test.passwordsapp.org/) with the login data user "firefox" and password "PasswordsApp".

## Build from repository
Instructions to build this version directly from the repository can be found in the file html/build.html
or in the extension settings under "Debug" -> "Build instructions and source code download".

## Build from source
To build this version from the supplied source, run the following commands:

```bash
npm ci
npm run build:firefox
rm ./build/updates.json
```

After this, the files in the "build" folder should match the uploaded extension.