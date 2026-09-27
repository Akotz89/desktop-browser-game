# Modular WebGPU 3D prototype

This is a technical test scene, not the chosen game. It checks WebGPU rendering, basic camera movement, and separate JavaScript files from a desktop folder in Chrome.

## Copy the test by hand (no ZIP required)

Create this folder layout in File Explorer. The `src` folder must be directly inside `BrowserGame`, beside `index.html`:

```
Desktop/
  BrowserGame/
    index.html
    src/
      00-namespace.js
      01-math.js
      02-camera.js
      03-input.js
      04-world.js
      05-shaders.js
      06-renderer.js
      07-main.js
```

Open each link below in GitHub, open the file's **Raw** view, copy its contents, and paste into a new file at the matching path above:

- [index.html](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/index.html)
- [00-namespace.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/00-namespace.js)
- [01-math.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/01-math.js)
- [02-camera.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/02-camera.js)
- [03-input.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/03-input.js)
- [04-world.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/04-world.js)
- [05-shaders.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/05-shaders.js)
- [06-renderer.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/06-renderer.js)
- [07-main.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/07-main.js)

When saving with Notepad, choose **Save as type: All Files** so Windows does not append `.txt` to `.html` or `.js` filenames.

Then open `Desktop\\BrowserGame\\index.html`. Use WASD to move, the arrow keys to look, and Q/E to move vertically. If the status says it could not load a script, check that the named `.js` file is inside `BrowserGame\\src` and is not saved with an extra `.txt` extension.

The ES-module check is optional and is not needed to run the scene. Its page and probe file are [es-modules-check.html](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/es-modules-check.html) and [module-probe.js](https://github.com/Akotz89/desktop-browser-game/blob/main/prototype/desktop-webgpu-world/src/module-probe.js).

## What this tests

The main page loads classic JavaScript files in order, without import/export or fetch. The WGSL shader is stored as a string in a JavaScript file. This keeps the code split into clear parts while avoiding a server, third-party library, WebAssembly, and a build step.

A successful scene shows a dark floor grid and a colored cube. Use the ES-module check separately to learn whether native JavaScript module imports work from this file URL in this Chrome setup.
