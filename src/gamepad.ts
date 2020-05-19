import { App, DirectiveBinding, VNode } from 'vue';
import { set, get } from './utils';
import { getAxisNameFromValue, getAxisNames } from './button-mapping';

export const enum ValidBindingResult {
  E_INVALID_ARG,
  E_INVALID_CALLBACK,
  E_OK,
}

export default function(app: App, options: VueGamepadOptions) {
  return class VueGamepad {
    private events: Array<any> = [];
    private holding: { [buttonName: string]: number } = {};
    private currentLayer = 0;
    private prevLayers: { [layer: number]: number } = {};
    private vnodeLayers: { [layer: number]: VNode[] } = {};

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
      const gamepads = navigator.getGamepads();
      return [...gamepads].filter((pad) => pad !== null) as Gamepad[];
    }

    /**
     * Check if a Vue directive binding is valid
     * @param {object} binding Vue binding from directive callback
     */
    validBinding(binding: DirectiveBinding, vnode: VNode): ValidBindingResult {
      // binding has no directive arg. (v-gamepad:XXXX)
      if (typeof binding.arg === 'undefined') {
        return ValidBindingResult.E_INVALID_ARG;
      }

      const isFunction = typeof binding.value === 'function';
      const hasOnClickIfEmpty = !isFunction && typeof vnode?.props?.onClick === 'function';

      // if no function callback is passed to the directive, we will try use the onClick
      // handler, if that is also not set, we have no callback.
      if (!isFunction && !hasOnClickIfEmpty) {
        return ValidBindingResult.E_INVALID_CALLBACK;
      }

      // everything ok!
      return ValidBindingResult.E_OK;
    }

    /**
     * Find the layer ID for the current vnode
     * @param {object} vnode Vue directive vnode
     */
    findLayerForVnode(vnode: VNode) {
      for (const layer in this.vnodeLayers) {
        const found = this.vnodeLayers[layer].find((vn) => vn === vnode);
        if (found) {
          return parseInt(layer, 10);
        }
      }

      return 0;
    }

    /**
     * Add an event listener
     * @param {string} event Name of the button event
     * @param {object} modifiers Vue binding modifiers
     * @param {function} callback Callback function when button is pressed
     * @param {object} vnode Vue directive vnode
     */
    addListener(event: string, modifiers: ListenerModifiers, callback: ListenerCallback, vnode: VNode) {
      const action = modifiers.released ? 'released' : 'pressed';
      const repeat = !!modifiers.repeat;

      //
      const layer = this.findLayerForVnode(vnode);

      // if we don't already have an array initialised for the current event do it now
      const events = get(this.events, [layer, action, event], []);
      if (events.length === 0) {
        set(this.events, [layer, action, event], []);
      }

      // register the event
      this.events[layer][action][event].push({ vnode, repeat, callback });

      // inject classes
      if (options.injectClasses && vnode && vnode.el) {
        vnode.el.classList.add('v-gamepad', `v-gamepad--${event}`);
      }
    }

    /**
     * Remove an event listener
     * @param {string} event Name of the button event
     * @param {object} modifiers Vue binding modifiers
     * @param {function} callback Callback function when button is pressed
     */
    removeListener(event: string, modifiers: ListenerModifiers, callback: ListenerCallback, vnode: VNode) {
      const action = modifiers.released ? 'released' : 'pressed';

      //
      const layer = this.findLayerForVnode(vnode);

      // get a list of all events for the current action
      let events = get<VueGamepadEvent>(this.events, [layer, action, event], []);
      if (events.length === 0) {
        return;
      }
      
      // we only want events which match the callback
      events = events.filter((evnt: ListenerEvent) => evnt.callback !== callback);

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
     * @param {number} layer ID of the layer to create
     */
    createLayer(layer: number, vnode: VNode) {
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
     * @param {number} layer ID of the layer to destroy
     */
    destroyLayer(layer: number) {
      // if we are current on the layer we are destroying, switch back
      if (layer === this.currentLayer) {
        this.switchToLayer(0);
      }

      // destroy layers
      delete this.prevLayers[layer];
      delete this.vnodeLayers[layer];
      delete this.events[layer];
    }

    /**
     * Switch to a specific layer
     * @param {number} layer ID of the layer to switch to
     */
    switchToLayer(layer = 0) {
      if (layer === this.currentLayer) {
        return;
      }

      // if we are not switching to the root layer, keep track of the current layer
      // so we can get back later
      if (layer !== 0) {
        this.prevLayers[layer] = this.currentLayer;
      }

      this.currentLayer = layer;
    }

    /**
     * Run all pressed button callbacks for the current layer
     * @param {string} buttonName Name of the button (or axis) to run callbacks for
     */
    private runPressedCallbacks(buttonName: string) {
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

          event.callback.call(window);
        }
      }
    }

    /**
     * Run all released button callbacks for the current layer
     * @param {string} buttonName Name of the button (or axis) to run callbacks for
     */
    private runReleasedCallbacks(buttonName: string) {
      delete this.holding[buttonName];

      const events = get<VueGamepadEvent>(this.events, [this.currentLayer, 'released', buttonName], []);
      if (events.length > 0) {
        const event = events[events.length - 1];
        event.callback.call(window);
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