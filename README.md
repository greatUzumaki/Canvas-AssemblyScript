# ð Welcome to my first AssemblyScript project!

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
â   index.html              // main index.html
â   webpack.config.js       // WebPack config
â   ...
â
ââââsrc
â   â   index.js            // JS entry file
â   â   style.css           // just styling
â   ââââ
â
ââââwasm
â   â   asconfig.json       // AS settings
â   â   ...
â   â
â   ââââassembly
â   â   â   index.ts        // main AS file
â   â   â   tsconfig.json   // TS settings
â   â   ââââ
â   â
â   ââââbuild               // folder for compiled modules
â
```
