# Modular WebGPU 3D prototype

This is a technical test scene, not the chosen game. It checks WebGPU rendering, basic camera movement, and whether separate JavaScript files can load from a desktop folder in Chrome.

## Open the test

1. Download the repository as a ZIP and extract it.
2. Open this folder and double-click index.html.
3. Use WASD to move, the arrow keys to look, and Q/E to move vertically.
4. Open es-modules-check.html from the same folder to test native JavaScript module imports.

## What the results mean

The main page uses multiple classic JavaScript files, each in its own source file and loaded in order. This tests a modular layout that does not use import/export or fetch. The WGSL shader is stored as a JavaScript string, so it is also loaded from a local script file rather than fetched.

The separate ES-module page reports whether import() works from this file URL in this Chrome setup. If it fails while the main scene works, we can keep the code modular with ordered script files and the shared ModularWorld namespace. If it passes, we can decide whether native modules are worth using for the full game.

A successful scene shows a dark floor grid and a colored cube. The status panel reports the secure-context flag and WebGPU startup errors, but does not block rendering based on that flag.

This prototype uses no third-party libraries, external services, fetched files, WebAssembly, or build step. The final game concept and world design remain open.
