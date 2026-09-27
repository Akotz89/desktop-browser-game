(function (app) {
  function createVertices() {
    const vertices = [];

    function addTriangle(a, b, c, color) {
      vertices.push(
        a[0], a[1], a[2], color[0], color[1], color[2],
        b[0], b[1], b[2], color[0], color[1], color[2],
        c[0], c[1], c[2], color[0], color[1], color[2]
      );
    }

    function addQuad(a, b, c, d, color) {
      addTriangle(a, b, c, color);
      addTriangle(a, c, d, color);
    }

    const floorColor = [0.16, 0.19, 0.24];
    addQuad([-10, 0, -10], [10, 0, -10], [10, 0, 10], [-10, 0, 10], floorColor);

    const gridColor = [0.25, 0.29, 0.35];
    const halfWidth = 0.012;
    for (let n = -5; n <= 5; n += 1) {
      if (n === 0) continue;
      const z = n;
      addQuad([-5, 0.006, z - halfWidth], [5, 0.006, z - halfWidth],
        [5, 0.006, z + halfWidth], [-5, 0.006, z + halfWidth], gridColor);
      const x = n;
      addQuad([x - halfWidth, 0.006, -5], [x + halfWidth, 0.006, -5],
        [x + halfWidth, 0.006, 5], [x - halfWidth, 0.006, 5], gridColor);
    }

    addQuad([-5, 0.008, -halfWidth], [5, 0.008, -halfWidth],
      [5, 0.008, halfWidth], [-5, 0.008, halfWidth], [0.58, 0.22, 0.20]);
    addQuad([-halfWidth, 0.009, -5], [halfWidth, 0.009, -5],
      [halfWidth, 0.009, 5], [-halfWidth, 0.009, 5], [0.18, 0.42, 0.68]);

    const p000 = [-0.5, 0, -0.5];
    const p100 = [0.5, 0, -0.5];
    const p110 = [0.5, 1, -0.5];
    const p010 = [-0.5, 1, -0.5];
    const p001 = [-0.5, 0, 0.5];
    const p101 = [0.5, 0, 0.5];
    const p111 = [0.5, 1, 0.5];
    const p011 = [-0.5, 1, 0.5];

    addQuad(p000, p100, p110, p010, [0.10, 0.62, 0.86]);
    addQuad(p101, p001, p011, p111, [0.12, 0.35, 0.58]);
    addQuad(p001, p000, p010, p011, [0.25, 0.72, 0.48]);
    addQuad(p100, p101, p111, p110, [0.82, 0.50, 0.18]);
    addQuad(p010, p110, p111, p011, [0.82, 0.79, 0.28]);
    addQuad(p001, p101, p100, p000, [0.42, 0.33, 0.68]);

    return new Float32Array(vertices);
  }

  app.world = { createVertices };
})(window.ModularWorld);
