# desktop-browser-game

A small browser game launched from a desktop folder.

## Planning status

The game concept is still undecided. WebGPU is the selected rendering direction, using browser APIs with JavaScript and WGSL shader source. WebAssembly and a developer-run compile toolchain are out of scope; the browser handles shader compilation at runtime.

A minimal, from-scratch WebGPU triangle page with inline WGSL has been tested successfully from a local file URL in the target Chrome setup. Direct local-file launch is viable in that tested setup.

## Modular 3D prototype

The first prototype is a neutral graybox used to test a modular WebGPU 3D foundation and local-file script loading. It does not define the game's theme or mechanics. See the [prototype instructions](prototype/desktop-webgpu-world/README.md).

## License

MIT. See [LICENSE](LICENSE).
