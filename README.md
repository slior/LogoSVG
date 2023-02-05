# Logo SVG

This is a very rudimentary implementation for a language (compiler + VM) and accompanying application that allows you to draw in SVG by issuing specific commands. 

It is very much inspired by the [Logo language](https://en.wikipedia.org/wiki/Logo_(programming_language)).

It is implemented purely in Javascript, running in a browser. No server code.
Refer to the [application description](./docs/App.md) and the [language reference](./docs/Lang.md) for more information about available functionality.


## Building
In order to build simply run `npm run build`.

In order to test (unit tests) run `npm test`.

## Running
To access the application, navigate to `index.html`.
You can simply do this by using a local http server running in the application directory (e.g. [http-server](https://www.npmjs.com/package/http-server)).

## Major 3rd Party Components

The compiler is implemented using [ohm-js](https://ohmjs.org/).

The application uses the [monaco editor](https://microsoft.github.io/monaco-editor/) for the code editor.