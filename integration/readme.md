# Development

## Integration Dev Server

To setup https on localhost:

- Install [minica](https://github.com/jsha/minica), a small simple CA tool to generate your own local root certificate and end-entity (aka leaf) certificates signed by it: `brew install minica`

- Generate the root keys then generate and sign an end-entity key in cert. `minica --domains wildcard.localhost.com`

- Add and trust the generated `minica.pem` to your local keystore: [generating SSL keys for development](gist.github.com/mwidmann/115c2a7059dcce300b61f625d887e5dc)

- Alias _wildcard.localhost.com_ to your loopback address: something like `echo '127.0.0.1    wildcard.localhost.com' >> /etc/hosts`

- Move or copy the entire generated wildcard.localhost.com/ to the integration/fixtures directory. These are configured in the test dev server.

- The browser should now be set up to run on https for checking cookies, secure cross site requests, etc.

- NOTE: these files are ignored and should not be committed.
