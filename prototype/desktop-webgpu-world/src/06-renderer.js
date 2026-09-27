function (app, global) {
  function createWebGLFallback(canvas, vertexData, reason) {
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) {
      throw new Error(
        "WebGPU is unavailable (" + reason + "), and this browser could not create a WebGL2 context."
      );
    }

    const vertexSource = [
      "#version 300 es",
      "in vec3 aPosition;",
      "in vec3 aColor;",
      "uniform mat4 uViewProjection;",
      "out vec3 vColor;",
      "void main() {",
      "  gl_Position = uViewProjection * vec4(aPosition, 1.0);",
      "  vColor = aColor;",
      "}"
    ].join("\n");

    const fragmentSource = [
      "#version 300 es",
      "precision highp float;",
      "in vec3 vColor;",
      "out vec4 outColor;",
      "void main() {",
      "  outColor = vec4(vColor, 1.0);",
      "}"
    ].join("\n");

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("WebGL2 could not create a shader.");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || "Unknown shader compile error.";
        gl.deleteShader(shader);
        throw new Error("WebGL2 shader error: " + message);
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error("WebGL2 could not create a program.");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "Unknown program link error.";
      gl.deleteProgram(program);
      throw new Error("WebGL2 program error: " + message);
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const colorLocation = gl.getAttribLocation(program, "aColor");
    const viewProjectionLocation = gl.getUniformLocation(program, "uViewProjection");
    if (positionLocation < 0 || colorLocation < 0 || !viewProjectionLocation) {
      gl.deleteProgram(program);
      throw new Error("WebGL2 could not find the scene shader inputs.");
    }

    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      gl.deleteProgram(program);
      throw new Error("WebGL2 could not create a vertex buffer.");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 12);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0.035, 0.05, 0.075, 1);

    function draw(viewProjection) {
      const pixelRatio = Math.min(global.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(viewProjectionLocation, false, viewProjection);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 6);
    }

    return {
      draw,
      backend: "WebGL2 fallback",
      fallbackReason: reason
    };
  }

  async function createRenderer(canvas, vertexData) {
    if (!global.navigator.gpu) {
      return createWebGLFallback(canvas, vertexData, "WebGPU API unavailable");
    }

    let adapter;
    try {
      adapter = await global.navigator.gpu.requestAdapter();
    } catch (error) {
      return createWebGLFallback(
        canvas,
        vertexData,
        error && error.message ? error.message : "adapter request failed"
      );
    }

    if (!adapter) {
      return createWebGLFallback(canvas, vertexData, "Chrome did not provide a WebGPU adapter");
    }

    let device;
    try {
      device = await adapter.requestDevice();
    } catch (error) {
      return createWebGLFallback(
        canvas,
        vertexData,
        error && error.message ? error.message : "WebGPU device request failed"
      );
    }

    const context = canvas.getContext("webgpu");
    if (!context) {
      return createWebGLFallback(canvas, vertexData, "WebGPU canvas context unavailable");
    }

    const format = global.navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "opaque" });

    const shader = device.createShaderModule({ code: app.shaderCode });
    const compilation = await shader.getCompilationInfo();
    const shaderErrors = compilation.messages.filter(function (message) {
      return message.type === "error";
    });
    if (shaderErrors.length) {
      throw new Error("WGSL error: " + shaderErrors.map(function (item) {
        return item.message;
      }).join(" | "));
    }

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shader,
        entryPoint: "vertexMain",
        buffers: [{
          arrayStride: 24,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" },
            { shaderLocation: 1, offset: 12, format: "float32x3" }
          ]
        }]
      },
      fragment: {
        module: shader,
        entryPoint: "fragmentMain",
        targets: [{ format }]
      },
      primitive: { topology: "triangle-list", cullMode: "none" },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less"
      }
    });

    const vertexBuffer = device.createBuffer({
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertexData);

    const cameraBuffer = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: cameraBuffer } }]
    });

    let depthTexture = null;
    let depthView = null;
    let lastWidth = 0;
    let lastHeight = 0;

    function resize() {
      const pixelRatio = Math.min(global.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
      if (width === lastWidth && height === lastHeight) return;

      canvas.width = width;
      canvas.height = height;
      lastWidth = width;
      lastHeight = height;

      if (depthTexture) depthTexture.destroy();
      depthTexture = device.createTexture({
        size: { width, height, depthOrArrayLayers: 1 },
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
      depthView = depthTexture.createView();
    }

    function draw(viewProjection) {
      resize();
      device.queue.writeBuffer(cameraBuffer, 0, viewProjection);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.035, g: 0.05, b: 0.075, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }],
        depthStencilAttachment: {
          view: depthView,
          depthClearValue: 1,
          depthLoadOp: "clear",
          depthStoreOp: "store"
        }
      });

      pass.setViewport(0, 0, canvas.width, canvas.height, 0, 1);
      pass.setScissorRect(0, 0, canvas.width, canvas.height);
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.setVertexBuffer(0, vertexBuffer);
      pass.draw(vertexData.length / 6);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }

    device.lost.then(function (info) {
      app.setStatus("GPU device lost: " + info.message, true);
    });

    return { draw, backend: "WebGPU", fallbackReason: "" };
  }

  app.renderer = { createRenderer };
})(window.ModularWorld, window)