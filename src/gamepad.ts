import { DirectiveBinding, VNode } from 'vue';
import { set, get } from './utils';
import { DefaultOptions, getAxisNameFromValue, getAxisNames } from './options';

export const enum ValidBindingResult {
  E_INVALID_ARG,
  E_INVALID_CALLBACK,
  E_OK,
}

export default function(options: VueGamepadOptions = DefaultOptions) {
  return class VueGamepad {
    events: VueGamepadEvents = {};
    holding: { [buttonName: string]: number } = {};
    currentLayer = '';
    prevLayers: { [layer: string]: string } = {};
    vnodeLayers: { [layer: string]: VNode[] } = {};

    constructor() {
      /**
       * A gamepad was connected
       */
      window.addEventListener('gamepadconnected', () => {
        document.body.classList.add(`${options.classPrefix}-connected`);
      });

      /**
       * A gamepad was disconnected
       */
      window.addEventListener('gamepaddisconnected', () => {
        const gamepads = this.getGamepads();
        if (gamepads.length === 0) {
          document.body.classList.remove(`${options.classPrefix}-connected`);
        }
      });

      // run!
      requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Get a list of currently connected gamepads
     */
    getGamepads(): Gamepad[] {
      const gamepads = navigator.getGamepads();
      return [...gamepads].filter((pad) => pad !== null) as Gamepad[];
    }

    /**
     * Check if a Vue directive binding is valid
     * @param {DirectiveBinding} binding Vue binding from directive callback
     * @param {VNode} [vnode] Vue directive vnode
     */
    validBinding(binding: DirectiveBinding, vnode?: VNode): ValidBindingResult {
      // binding has no directive arg. (v-gamepad:XXXX)
      if (typeof binding.arg === 'undefined') {
        return ValidBindingResult.E_INVALID_ARG;
      }

      const isFunction = typeof binding.value === 'function';
      const hasOnClickCallback = typeof vnode?.props?.onClick === 'function';

      // if no function callback is passed to the directive, we will try use the onClick
      // handler, if that is also not set, we have no callback.
      if (!isFunction && !hasOnClickCallback) {
        return ValidBindingResult.E_INVALID_CALLBACK;
      }

      // everything ok!
      return ValidBindingResult.E_OK;
    }

    /**
     * Get the layer ID for a given vnode
     * @param {VNode} vnode Vue directive vnode
     */
    getVNodeLayer(vnode?: VNode): string {
      if (vnode) {
        for (const layer in this.vnodeLayers) {
          const found = this.vnodeLayers[layer].find((vn) => vn === vnode);
          if (found) {
            return layer;
          }
        }
      }

      return '';
    }

    /**
     * Add an event listener
     * @param {string} event Name of the button event
     * @param {ListenerModifiers} modifiers Vue binding modifiers
     * @param {ListenerCallback} callback Callback function when button is pressed
     * @param {VNode} [vnode] Vue directive vnode
     */
    addListener(event: string, modifiers: ListenerModifiers, callback: ListenerCallback, vnode?: VNode): void {
      const action = modifiers.released ? 'released' : 'pressed';
      const repeat = !!modifiers.repeat;
      const layer = this.getVNodeLayer(vnode);

      // if we don't already have an array initialised for the current event do it now
      const events = get<VueGamepadEvent>(this.events, [layer, action, event], []);
      if (events.length === 0) {
        set(this.events, [layer, action, event], []);
      }

      // register the event
      this.events[layer][action][event].push({ vnode, repeat, callback });

      // inject classes
      if (options.injectClasses && vnode && vnode.el) {
        vnode.el.classList.add(options.classPrefix, `${options.classPrefix}--${event}`);
      }
    }

    /**
     * Remove an event listener
     * @param {string} event Name of the button event
     * @param {ListenerModifiers} modifiers Vue binding modifiers
     * @param {ListenerCallback} callback Callback function when button is pressed
     * @param {VNode} [vnode] Vue directive vnode
     */
    removeListener(event: string, modifiers: ListenerModifiers, callback: ListenerCallback, vnode?: VNode): void {
      const action = modifiers.released ? 'released' : 'pressed';
      const layer = this.getVNodeLayer(vnode);

      // get a list of all events for the current action
      let events = get<VueGamepadEvent>(this.events, [layer, action, event], []);
      if (events.length === 0) {
        return;
      }
      
      // we only want events which match the callback
      events = events.filter((e: VueGamepadEvent) => e.callback !== callback);

      // if we have any remaining events after the filter, update the array
      // otherwise delete the object
      if (events.length > 0) {
        set(this.events, [layer, action, event], events);
      } else {
        delete this.events[layer][action][event];
      }
    }

    /**
     * Create a new layer (INTERNAL)
     * @param {string} layer ID of the layer to create
     * @param {VNode} vnode Vue directive vnode
     */
    createLayer(layer: string, vnode: VNode): void {
      if (!Array.isArray(vnode.children)) {
        return;
      }

      // init array if layer doesn't exist
      if (typeof this.vnodeLayers[layer] === 'undefined') {
        this.vnodeLayers[layer] = [];
      }

      vnode.children.forEach((child) => this.vnodeLayers[layer].push(child as VNode));
    }

    /**
     * Destroy layer and go back to the previous layer (INTERNAL)
     * @param {string} layer ID of the layer to destroy
     */
    destroyLayer(layer: string): void {
      // if we are current on the layer we are destroying, switch back
      if (layer === this.currentLayer) {
        this.currentLayer = this.prevLayers[layer];
      }

      // destroy layers
      delete this.prevLayers[layer];
      delete this.vnodeLayers[layer];
      delete this.events[layer];
    }

    /**
     * Switch to a specific layer
     * @param {string} layer ID of the layer to switch to
     */
    switchToLayer(layer = ''): void {
      if (layer === this.currentLayer) {
        return;
      }

      // if we are not switching to the root layer, keep track of the current layer
      // so we can get back later
      if (layer !== '') {
        this.prevLayers[layer] = this.currentLayer;
      }

      this.currentLayer = layer;
    }

    /**
     * Helper function to switch back to the default layer
     */
    switchToDefaultLayer(): void {
      return this.switchToLayer('');
    }

    /**
     * Run all pressed button callbacks for the current layer
     * @param {string} buttonName Name of the button (or axis) to run callbacks for
     * @param {gamepad} gamepad Gamepad object which triggered the event
     */
    runPressedCallbacks(buttonName: string, gamepad: Gamepad): void {
      const events = get<VueGamepadEvent>(this.events, [this.currentLayer, 'pressed', buttonName], []);
      if (events.length > 0) {
        const firstPress = typeof this.holding[buttonName] === 'undefined';
        const currentTime = Date.now();
        const event = events[events.length - 1];

        // button was just pressed, or is repeating
        if (firstPress || (event.repeat && (currentTime - this.holding[buttonName]) >= options.buttonRepeatTimeout)) {
          this.holding[buttonName] = currentTime;

          // was first press
          if (firstPress) {
            this.holding[buttonName] += (options.buttonInitialTimeout - options.buttonRepeatTimeout);
          }

          event.callback.call(null, { buttonName, gamepad });
        }
      }
    }

    /**
     * Run all released button callbacks for the current layer
     * @param {string} buttonName Name of the button (or axis) to run callbacks for
     * @param {gamepad} gamepad Gamepad object which triggered the event
     */
    runReleasedCallbacks(buttonName: string, gamepad: Gamepad): void {
      delete this.holding[buttonName];

      const events = get<VueGamepadEvent>(this.events, [this.currentLayer, 'released', buttonName], []);
      if (events.length > 0) {
        const event = events[events.length - 1];
        event.callback.call(null, { buttonName, gamepad });
      }
    }

    /**
     * Main loop
     */
    update(): void {
      const gamepads = this.getGamepads();
      gamepads.forEach((gamepad) => {
        // update gamepad button
        gamepad.buttons.forEach((button: GamepadButton, index: number) => {
          const buttonName = options.buttonNames[index];

          if (button.pressed) {
            this.runPressedCallbacks(buttonName, gamepad);
          } else if (typeof this.holding[buttonName] !== 'undefined') {
            this.runReleasedCallbacks(buttonName, gamepad);
          }
        });

        // update gamepad axes
        gamepad.axes.forEach((value: number, index: number) => {
          if (value >= options.analogThreshold || value <= -(options.analogThreshold)) {
            const axisName = getAxisNameFromValue(index, value);
            this.runPressedCallbacks(axisName, gamepad);
          } else {
            const axisNames = getAxisNames(index);

            // trigger the release event if this axis was previously "pressed"
            axisNames.filter((axisName) => this.holding[axisName])
              .forEach((axisName) => this.runReleasedCallbacks(axisName, gamepad));
          }
        });
      });

      requestAnimationFrame(this.update.bind(this));
    }
  };
}