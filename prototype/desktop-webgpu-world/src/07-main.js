(function (app, global) {
  async function start() {
    const canvas = document.getElementById("worldCanvas");
    const secure = Boolean(global.isSecureContext);
    app.setStatus("Secure-context flag: " + secure + " · starting WebGPU…");

    const input = app.input.createInput();
    const camera = app.camera.createCamera();
    const vertices = app.world.createVertices();
    const renderer = await app.renderer.createRenderer(canvas, vertices);

    const backendStatus = renderer.fallbackReason
      ? renderer.backend + " ready · WebGPU unavailable: " + renderer.fallbackReason
      : renderer.backend + " ready";
    app.setStatus(backendStatus + " · WASD move · arrows look · Q/E vertical · secure-context flag: " + secure);
    let previousTime = 0;

    function frame(now) {
      const deltaSeconds = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      previousTime = now;
      camera.update(deltaSeconds, input.keys);
      const aspect = canvas.width / Math.max(1, canvas.height);
      renderer.draw(camera.getViewProjection(aspect));
      global.requestAnimationFrame(frame);
    }

    global.requestAnimationFrame(frame);
  }

  start().catch(function (error) {
    app.setStatus("Startup failed: " + (error && error.message ? error.message : String(error)), true);
    console.error(error);
  });
})(window.ModularWorld, window);
