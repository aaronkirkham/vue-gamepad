import { set, get } from './utils';
import { getAxisNameFromValue, getAxisNames } from './button-mapping';

export default function (Vue, options = {}) {
  return class Gamepad {
    constructor() {
      this.holding = {};
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
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback function to trigger
     * @param {object} vnode vue directive vnode
     */
    addListener(event, modifiers, callback, vnode = null) {
      const action = modifiers.released ? 'released' : 'pressed';
      const repeat = !!modifiers.repeat;

      this.debug(`listening for '${event}' '${action}' (repeat? ${repeat}) on layer ${this.layer}...`);

      // if we don't already have an array initialised for the current event
      // do it now
      const events = get(this.events, [this.layer, action, event], []);
      if (events.length === 0) {
        set(this.events, [this.layer, action, event], []);
      }

      // register the event
      this.events[this.layer][action][event].push({ vnode, repeat, callback });

      // inject classes
      if (options.injectClasses && vnode && vnode.elm) {
        vnode.elm.classList.add('v-gamepad', `v-gamepad--${event}`);
      }
    }

    /**
     * remove an event handler
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback trigger function
     */
    removeListener(event, modifiers, callback) {
      const action = modifiers.released ? 'released' : 'pressed';
      this.debug(`removing listener for '${event}' '${action}' on layer ${this.layer}...`);

      // get a list of all events for the current action
      let events = get(this.events, [this.layer, action, event], []);
      if (events.length > 0) {
        // filter any events which have same callback
        events = events.filter(event => event.callback !== callback);

        // if we have any remaining events after the filter, update the array
        // otherwise delete the object
        if (events.length > 0) {
          set(this.events, [this.layer, action, event], events);
        }
        else {
          delete this.events[this.layer][action][event];
        }
      }
    }

    /**
     * switch to a new layer
     * @param {number} layer layer number to switch to
     */
    switchToLayer(layer) {
      if (this.layer != layer) {
        // keep track of the old layer before we switch
        this.layers[layer] = this.layer;
        this.layer = layer;

        this.debug(`switched to layer ${this.layer}.`);
      }
    }

    /**
     * remove a layer, delete the registered events and switch back to the old layer
     * @param {number} layer layer number to remove
     */
    removeLayer(layer) {
      // switch back to the previous layer
      this.layer = this.layers[layer];
      delete this.layers[layer];

      // delete the layer events
      delete this.events[layer];

      this.debug(`switched back to layer ${this.layer}.`);
    }

    /**
     * main loop
     */
    run() {
      this.getGamepads().forEach(pad => {
        // check gamepad buttons
        pad.buttons.forEach((button, index) => {
          const name = options.buttonNames[index];

          // button is pressed
          if (button.pressed) {
            const now = Date.now();
            const events = get(this.events, [this.layer, 'pressed', name], []);

            if (events.length > 0) {
              const event = events[events.length - 1];

              // button was just pressed, or is repeating
              if (typeof this.holding[name] === 'undefined' || (event.repeat && (now - this.holding[name]) >= options.buttonRepeatTimeout)) {
                this.holding[name] = now;
                event.callback.call();
              }
            }
          }
          // button was released
          else if (!button.pressed && typeof this.holding[name] !== 'undefined') {
            delete this.holding[name];

            const events = get(this.events, [this.layer, 'released', name], []);
            if (events.length > 0) {
              const event = events[events.length - 1];
              event.callback.call();
            }
          }
        });

        // check gamepad axis
        pad.axes.forEach((value, index) => {
          if (value >= options.analogThreshold || value <= -(options.analogThreshold)) {
            const name = getAxisNameFromValue(index, value);
            const events = get(this.events, [this.layer, 'pressed', name], []);

            if (events.length > 0) {
              const event = events[events.length - 1];
              const now = Date.now();

              // axis was just moved, or is repeating
              if (typeof this.holding[name] === 'undefined' || (event.repeat && (now - this.holding[name]) >= options.buttonRepeatTimeout)) {
                this.holding[name] = now;
                event.callback.call();
              }
            }
          }
          else {
            const names = getAxisNames(index);

            // trigger the release event if this axis was previously pressed
            names.filter(name => this.holding[name])
              .forEach(name => {
                delete this.holding[name];

                const events = get(this.events, [this.layer, 'released', name], []);
                if (events.length > 0) {
                  const event = events[events.length - 1];
                  event.callback.call();
                }
              });
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
     * @return {boolean}
     */
    isValidBinding(binding) {
      return typeof binding.arg !== 'undefined' &&
            (typeof binding.value === 'function' || (typeof binding.value === 'undefined' && typeof binding.expression === 'undefined'));
    }

    debug(...args) {
      if (!options.silent) {
        console.log('%cvue-gamepad', 'background:#fc0;color:#000', ...args);
      }
    }

    error(...args) {
      console.error('%cvue-gamepad', 'background:#fc0;color:#000', ...args);
    }
  }
}