(function (app, global) {
  function createInput() {
    const keys = Object.create(null);
    const supported = new Set([
      "w", "a", "s", "d", "q", "e",
      "arrowup", "arrowdown", "arrowleft", "arrowright"
    ]);

    global.addEventListener("keydown", function (event) {
      const key = event.key.toLowerCase();
      if (!supported.has(key)) return;
      keys[key] = true;
      event.preventDefault();
    });

    global.addEventListener("keyup", function (event) {
      keys[event.key.toLowerCase()] = false;
    });

    global.addEventListener("blur", function () {
      Object.keys(keys).forEach(function (key) { keys[key] = false; });
    });

    return { keys };
  }

  app.input = { createInput };
})(window.ModularWorld, window);
