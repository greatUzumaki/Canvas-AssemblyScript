# 🚀 Welcome to my first AssemblyScript project!

This project has been created using **webpack-cli**
<br/>
<br/>

```
npm run asbuild
```

or

```
yarn asbuild
```

to compile WebAssembly module
<br/>
<br/>
<br/>

```
npm run build
```

or

```
yarn build
```

to bundle your application
<br/>
<br/>

## Project struct

```
project
│   index.html              // main index.html
│   webpack.config.js       // WebPack config
│   ...
│
└───src
│   │   index.js            // JS entry file
│   │   style.css           // just styling
│   └───
│
└───wasm
│   │   asconfig.json       // AS settings
│   │   ...
│   │
│   └───assembly
│   │   │   index.ts        // main AS file
│   │   │   tsconfig.json   // TS settings
│   │   └───
│   │
│   └───build               // folder for compiled modules
│
```
