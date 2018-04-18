const VueGamepad = {
  _animation_frame: null,
  _bindings: [],
  _pressed_buttons: new Set(),

  install(Vue) {
    // request the animation frame
    this._animation_frame = requestAnimationFrame(this.frame.bind(this));

    // install gamepad events
    // window.addEventListener('gamepadconnected', this.gamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.gamepadDisconnected.bind(this));

    // register the pressed directive
    Vue.directive('gamepad-pressed', {
      bind: (el, binding, vnode) => {
        // register the gamepad binding
        Object.keys(binding.value).forEach(bind => this._bindings.push({ bind, callback: binding.value[bind], action: 'pressed', ctx: vnode.context }));
      }
    });

    // register the released directive
    Vue.directive('gamepad-released', {
      bind: (el, binding, vnode) => {
        // register the gamepad binding
        Object.keys(binding.value).forEach(bind => this._bindings.push({ bind, callback: binding.value[bind], action: 'released', ctx: vnode.context }));
      }
    })
  },

  /**
   * Gamepad connected event
   */
  gamepadConnected(event) {
    console.log('gamepadConnected');
    console.log(navigator.getGamepads());
  },

  /**
   * Gamepad disconnected event
   */
  gamepadDisconnected(event) {
    console.log('gamepadDisconnected');
    console.log(navigator.getGamepads());
  },

  /**
   * Main loop
   */
  frame() {
    // get a list of active gamepads
    const gamepads = Array.prototype.filter.call(navigator.getGamepads(), gamepad => gamepad !== null);

    // loop over all connected gamepads
    gamepads.forEach(gamepad => {
      // loop over all axes
      // gamepad.axes.forEach((axes, index) => {
      //   if (axes == 1 || axes == -1) {
      //     const axis = this.getAxisName(index, axes);

      //     if (!this._pressed_buttons.has(axis)) {
      //       console.debug(`moved axis!`, axis);
      //       this._pressed_buttons.add(axis);
      //     }
      //   }
      // });

      // loop over all buttons
      gamepad.buttons.forEach((button, index) => {
        const name = this.getButtonName(index);

        if (button.pressed && !this._pressed_buttons.has(name)) {
          console.debug(`pressed button!`, name);
          this._pressed_buttons.add(name);
          this.handlePressedButton(name);
        }
        else if (!button.pressed && this._pressed_buttons.has(name)) {
          console.debug(`released button!`, name);
          this._pressed_buttons.delete(name);
          this.handleReleasedButton(name);
        }
      });
    });

    // request the next frame
    this._animation_frame = requestAnimationFrame(this.frame.bind(this));
  },

  /**
   * Handle button pressed
   */
  handlePressedButton(button) {
    const bindings = this._bindings.filter(binding => binding.bind === button && binding.action === 'pressed');
    bindings.forEach(binding => binding.callback.call(binding.context, binding.context));
  },

  /** 
   * Handle button releases
   */
  handleReleasedButton(button) {
    const bindings = this._bindings.filter(binding => binding.bind === button && binding.action === 'released');
    bindings.forEach(binding => binding.callback.call(binding.context, binding.context));
  },

  /**
   * Helper function to convert controller buttons from indexes to names
   */
  getButtonName(button) {
    if (button === 0) return `button-a`;
    else if (button === 1) return `button-b`;
    else if (button === 2) return `button-x`;
    else if (button === 3) return `button-y`;
    else if (button === 4) return `bumper-left`;
    else if (button === 5) return `bumper-right`;
    else if (button === 6) return `trigger-left`;
    else if (button === 7) return `trigger-right`;
    else if (button === 8) return `button-select`;
    else if (button === 9) return `button-start`;
    else if (button === 10) return `left-stick-in`;
    else if (button === 11) return `right-stick-in`;
    else if (button === 12) return `button-dpad-up`;
    else if (button === 13) return `button-dpad-down`;
    else if (button === 14) return `button-dpad-left`;
    else if (button === 15) return `button-dpad-right`;

    return `unknown-button`;
  },

  /**
   * Helper function to convert controller axis from indexes and values to names
   */
  getAxisName(axis, value) {
    if (axis === 0 && value == -1) return `left-stick-left`;
    else if (axis === 0 && value == 1) return `left-stick-right`;
    else if (axis === 1 && value == -1) return `left-stick-up`;
    else if (axis === 1 && value == 1) return `left-stick-down`;
    else if (axis === 2 && value == -1) return `right-stick-left`;
    else if (axis === 2 && value == 1) return `right-stick-right`;
    else if (axis === 3 && value == -1) return `right-stick-up`;
    else if (axis === 3 && value == 1) return `right-stick-down`;

    return `unknown-axis`;
  },
};

export default VueGamepad;