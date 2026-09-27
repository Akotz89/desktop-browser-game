(function (app, global) {
  async function createRenderer(canvas, vertexData) {
    if (!global.navigator.gpu) {
      throw new Error("navigator.gpu is unavailable in this Chrome context.");
    }

    const adapter = await global.navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("Chrome did not provide a WebGPU adapter.");
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (!context) {
      throw new Error("The browser could not create a WebGPU canvas context.");
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

    return { draw };
  }

  app.renderer = { createRenderer };
})(window.ModularWorld, window);
