export default function (Vue, options = {}) {
  return class Gamepad {
    constructor() {
      this.pressed = new Set();
      this.events = {};
      this.layer = 0;
      this.layers = {};

      window.addEventListener('gamepadconnected', this.padConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.padDisconnected.bind(this));

      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }

    /**
     * gamepad was connected
     * @param {GamepadEvent} event 
     */
    padConnected(event) {
      document.body.classList.add('gamepad-connected');
    }

    /**
     * gamepad was disconnected
     * @param {GamepadEvent} event 
     */
    padDisconnected(event) {
      if (this.getGamepads().length === 0) {
        document.body.classList.remove('gamepad-connected');
      }
    }

    /**
     * add an event handler
     * @param {string} action type of action on the button (pressed, released)
     * @param {string} event name of the button event
     * @param {function} callback function to trigger
     * @param {object} vnode vue directive vnode
     */
    addListener(action, event, callback, vnode = null) {
      console.log(`listening for '${event}' on layer ${this.layer}...`);

      // TODO: handle action

      // setup the current layer if needed
      if (typeof this.events[this.layer] === 'undefined') {
        this.events[this.layer] = {};
        options.buttonNames.forEach(b => this.events[this.layer][b] = []);
      }

      // register the event
      this.events[this.layer][event].push({ vnode, callback });
      console.log(this.events[this.layer][event]);
    }

    /**
     * remove an event handler
     * @param {string} event name of the button event
     * @param {function} callback trigger function
     */
    removeListener(event, callback) {
      console.log(`removing listener for '${event}' on layer ${this.layer}...`);

      const events = this.events[this.layer];
      events[event] = events[event].filter(e => e.callback !== callback);
    }

    /**
     * switch to a new layer
     * @param {*} layer 
     */
    switchToLayer(layer) {
      if (this.layer != layer) {
        // keep track of the old layer before we switch
        this.layers[layer] = this.layer;
        this.layer = layer;

        console.log(`switched to layer ${this.layer}.`);
      }
    }

    /**
     * remove a layer, delete the registered events and switch back to the old layer
     * @param {*} layer 
     */
    removeLayer(layer) {
      // switch back to the previous layer
      this.layer = this.layers[layer];
      delete this.layers[layer];

      // delete the layer events
      delete this.events[layer];

      console.log(`switched back to layer ${this.layer}.`);
    }

    /**
     * main loop
     */
    run() {
      this.getGamepads().forEach(pad => {
        // check gamepad buttons
        pad.buttons.forEach((button, index) => {
          const name = options.buttonNames[index];
          const events = this.events[this.layer][name];

          // button is pressed
          if (button.pressed && !this.pressed.has(name)) {
            this.pressed.add(name);

            if (events.length > 0) {
            }
          }
          // button was released
          else if (!button.pressed && this.pressed.has(name)) {
            this.pressed.delete(name);

            if (events.length > 0) {
              const event = events[events.length - 1];
              event.callback.call();
            }
          }
        });
      });

      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }

    /**
     * get an array of active gamepads
     * @return {array}
     */
    getGamepads() {
      return Array.from(navigator.getGamepads()).filter(pad => pad !== null);
    }

    /**
     * helper function to test if a binding is valid
     * @param {object} binding binding to test which includes arg & value
     */
    isValidBinding(binding) {
      return typeof binding.arg !== 'undefined' &&
            options.buttonNames.includes(binding.arg) &&
            (typeof binding.value === 'function' || (typeof binding.value === 'undefined' && typeof binding.expression === 'undefined'));
    }
  }
}