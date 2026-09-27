# desktop-browser-game

A small browser game launched from a desktop folder.

## Planning status

The game concept is still undecided. WebGPU is the selected rendering direction, using browser APIs with JavaScript and WGSL shader source. WebAssembly and a developer-run compile toolchain are out of scope; the browser handles shader compilation at runtime.

The launch method remains to be validated: Chrome requires a secure context for WebGPU, so opening the HTML file directly with `file://` will not be enough. The project should avoid external libraries, CDNs, and runtime network dependencies where practical.

## License

MIT. See [LICENSE](LICENSE).
