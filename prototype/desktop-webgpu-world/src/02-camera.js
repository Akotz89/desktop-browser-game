(function (app) {
  function createCamera() {
    const position = [3, 2.4, 5];
    let yaw = Math.atan2(-3, -5);
    let pitch = Math.atan2(-2.4, Math.hypot(3, 5));

    function update(deltaSeconds, keys) {
      const turnSpeed = 1.7;
      const moveSpeed = 3.0;

      if (keys.arrowleft) yaw -= turnSpeed * deltaSeconds;
      if (keys.arrowright) yaw += turnSpeed * deltaSeconds;
      if (keys.arrowup) pitch += turnSpeed * deltaSeconds;
      if (keys.arrowdown) pitch -= turnSpeed * deltaSeconds;
      pitch = Math.max(-1.35, Math.min(1.35, pitch));

      let forwardAmount = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
      let sideAmount = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
      const moveLength = Math.hypot(forwardAmount, sideAmount);
      if (moveLength > 1) {
        forwardAmount /= moveLength;
        sideAmount /= moveLength;
      }

      const forwardX = Math.sin(yaw);
      const forwardZ = Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      position[0] += (forwardX * forwardAmount + rightX * sideAmount) * moveSpeed * deltaSeconds;
      position[2] += (forwardZ * forwardAmount + rightZ * sideAmount) * moveSpeed * deltaSeconds;
      position[1] += ((keys.e ? 1 : 0) - (keys.q ? 1 : 0)) * moveSpeed * deltaSeconds;
    }

    function getViewProjection(aspect) {
      const cosPitch = Math.cos(pitch);
      const target = [
        position[0] + Math.sin(yaw) * cosPitch,
        position[1] + Math.sin(pitch),
        position[2] + Math.cos(yaw) * cosPitch
      ];
      const view = app.math.lookAt(position, target, [0, 1, 0]);
      const projection = app.math.perspective(Math.PI / 3, aspect, 0.1, 100);
      return app.math.multiply(projection, view);
    }

    return { update, getViewProjection };
  }

  app.camera = { createCamera };
})(window.ModularWorld);
