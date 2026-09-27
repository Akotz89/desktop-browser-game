# Modular WebGPU 3D prototype

This is a technical test scene, not the chosen game. It checks WebGPU rendering, basic camera movement, and whether separate JavaScript files can load from a desktop folder in Chrome.

## Open the test

1. Download the repository as a ZIP and extract it.
2. Keep the prototype folder together with its `src` subfolder. The required layout is:
   ```
   desktop-webgpu-world/
     index.html
     es-modules-check.html
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
3. Open `desktop-webgpu-world/index.html` from that extracted folder.
4. Use WASD to move, the arrow keys to look, and Q/E to move vertically.
5. Open `es-modules-check.html` from the same folder to test native JavaScript module imports.

If the status panel reports that it could not load a local script, confirm the `src` folder is beside `index.html` and contains all eight JavaScript files above.

## What the results mean

The main page uses multiple classic JavaScript files, each in its own source file and loaded in order. This tests a modular layout that does not use import/export or fetch. The WGSL shader is stored as a JavaScript string, so it is also loaded from a local script file rather than fetched.

The separate ES-module page reports whether import() works from this file URL in this Chrome setup. If it fails while the main scene works, we can keep the code modular with ordered script files and the shared ModularWorld namespace. If it passes, we can decide whether native modules are worth using for the full game.

A successful scene shows a dark floor grid and a colored cube. The status panel reports the secure-context flag and WebGPU startup errors, but does not block rendering based on that flag.

This prototype uses no third-party libraries, external services, fetched files, WebAssembly, or build step. The final game concept and world design remain open.
