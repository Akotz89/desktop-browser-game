(function (global) {
  const app = {};

  app.setStatus = function (message, isError) {
    const status = document.getElementById("status");
    if (!status) return;
    status.textContent = message;
    status.className = isError ? "error" : "";
  };

  global.ModularWorld = app;
})(window);
