# desktop-browser-game

A small browser game launched from a desktop folder.

## Planning status

The game concept is still undecided. WebGPU is the selected rendering direction, using browser APIs with JavaScript and WGSL shader source. WebAssembly and a developer-run compile toolchain are out of scope; the browser handles shader compilation at runtime.

A minimal, from-scratch WebGPU triangle page with inline WGSL has been tested successfully from a local `file://` URL in the target Chrome setup. Direct local-file launch is viable in that tested setup. The finished game still needs to be checked there with its final inputs, rendering, and local assets.

The project should avoid external libraries, CDNs, and runtime network dependencies where practical.

## License

MIT. See [LICENSE](LICENSE).
