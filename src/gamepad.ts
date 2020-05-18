import { App, DirectiveBinding, VNode } from 'vue';
import { set, get } from './utils';
import { getAxisNameFromValue, getAxisNames } from './button-mapping';

export default function(app: App, options: VueGamepadOptions) {
  return class VueGamepad {
    private events: Array<any> = [];
    private holding: { [buttonName: string]: number } = {};
    private layer: number = 0;
    // private layers: any = {}; // TODO

    constructor() {
      /**
       * A gamepad was connected
       */
      window.addEventListener('gamepadconnected', () => {
        document.body.classList.add('gamepad-connected');
      });

      /**
       * A gamepad was disconnected
       */
      window.addEventListener('gamepaddisconnected', () => {
        const gamepads = this.getGamepads();
        if (gamepads.length === 0) {
          document.body.classList.remove('gamepad-connected');
        }
      });

      // run!
      requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Get a list of currently connected gamepads
     */
    getGamepads(): Gamepad[] {
      const gamepads = <Gamepad[]>navigator.getGamepads();
      return [...gamepads].filter((pad) => pad !== null);
    }

    /**
     * Check if a Vue directive binding is valid
     * @param {object} binding Vue binding from directive callback
     */
    validBinding(binding: DirectiveBinding): boolean {
      const hasArg = typeof binding.arg !== 'undefined';
      const isFunctionOrEmpty = (typeof binding.value === 'function' || typeof binding.value === 'undefined');

      return (hasArg && isFunctionOrEmpty);
    }

    /**
     * Add an event listener
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback callback function when button is pressed
     * @param {object} vnode vue directive vnode
     */
    addListener(event: string, modifiers: ListenerModifiers, callback: ListenerCallback, vnode: VNode) {
      const action = modifiers.released ? 'released' : 'pressed';
      const repeat = !!modifiers.repeat;

      // if we don't already have an array initialised for the current event do it now
      const events = get(this.events, [this.layer, action, event], []);
      if (events.length === 0) {
        set(this.events, [this.layer, action, event], []);
      }

      // register the event
      this.events[this.layer][action][event].push({ vnode, repeat, callback });

      // inject classes
      if (options.injectClasses && vnode && vnode.el) {
        vnode.el.classList.add('v-gamepad', `v-gamepad--${event}`);
      }
    }

    /**
     * Remove an event listener
     * @param {string} event name of the button event
     * @param {object} modifiers vue binding modifiers
     * @param {function} callback ccallback function when button is pressed
     */
    removeListener(event: string, modifiers: ListenerModifiers, callback: ListenerCallback) {
      const action = modifiers.released ? 'released' : 'pressed';

      // get a list of all events for the current action
      let events = get<VueGamepadEvent>(this.events, [this.layer, action, event], []);
      if (events.length > 0) {
        // filter any events which have same callback
        events = events.filter((e: ListenerEvent) => e.callback !== callback);

        // if we have any remaining events after the filter, update the array
        // otherwise delete the object
        if (events.length > 0) {
          set(this.events, [this.layer, action, event], events);
        } else {
          delete this.events[this.layer][action][event];
        }
      }
    }

    /**
     * Run all pressed button callbacks for the current layer
     * @param {string} buttonName Name of the button (or axis) to run callbacks for
     */
    private runPressedCallbacks(buttonName: string) {
      const firstPress = typeof this.holding[buttonName] === 'undefined';
      const currentTime = Date.now();

      const events = get<VueGamepadEvent>(this.events, [this.layer, 'pressed', buttonName], []);
      if (events.length > 0) {
        const event = events[events.length - 1];

        // button was just pressed, or is repeating
        if (firstPress || (event.repeat && (currentTime - this.holding[buttonName]) >= options.buttonRepeatTimeout)) {
          this.holding[buttonName] = currentTime;

          // was first press
          if (firstPress) {
            this.holding[buttonName] += (options.buttonInitialTimeout - options.buttonRepeatTimeout);
          }

          event.callback();
        }
      }
    }

    /**
     * Run all released button callbacks for the current layer
     * @param {string} buttonName Name of the button (or axis) to run callbacks for
     */
    private runReleasedCallbacks(buttonName: string) {
      delete this.holding[buttonName];

      const events = get<VueGamepadEvent>(this.events, [this.layer, 'released', buttonName], []);
      if (events.length > 0) {
        const event = events[events.length - 1];
        event.callback();
      }
    }

    /**
     * Main loop
     */
    update() {
      const gamepads = this.getGamepads();
      gamepads.forEach((gamepad) => {
        // update gamepad button
        gamepad.buttons.forEach((button: GamepadButton, index: number) => {
          const buttonName = options.buttonNames[index];

          if (button.pressed) {
            this.runPressedCallbacks(buttonName);
          } else if (typeof this.holding[buttonName] !== 'undefined') {
            this.runReleasedCallbacks(buttonName);
          }
        });

        // update gamepad axes
        gamepad.axes.forEach((value: number, index: number) => {
          if (value >= options.analogThreshold || value <= -(options.analogThreshold)) {
            const axisName = getAxisNameFromValue(index, value);
            this.runPressedCallbacks(axisName);
          } else {
            const axisNames = getAxisNames(index);

            // trigger the release event if this axis was previously "pressed"
            axisNames.filter((axisName) => this.holding[axisName])
              .forEach((axisName) => this.runReleasedCallbacks(axisName));
          }
        });
      });

      requestAnimationFrame(this.update.bind(this));
    }
  };
}