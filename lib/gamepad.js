export const BUTTON_NAMES = [
  'button-a', 'button-b', 'button-x', 'button-y',
  'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
  'button-select', 'button-start',
  'left-stick-in', 'right-stick-in',
  'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
  'vendor'
];

export class Gamepad {
  constructor(Vue, options) {
    console.log(`Vue gamepad constructor`);

    this.pressed = new Set();
    this.events = {};
    this.layer = 0;
    this.layers = {};

    window.addEventListener('gamepadconnected', this.padConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.padDisconnected.bind(this));

    this.animationFrame = requestAnimationFrame(this.run.bind(this));
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

    // setup the current layer if needed
    if (typeof this.events[this.layer] === 'undefined') {
      this.events[this.layer] = {};
      BUTTON_NAMES.forEach(b => this.events[this.layer][b] = []);
    }

    // register the event
    this.events[this.layer][event].push({ vnode, callback });
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
   * gamepad was connected
   */
  padConnected(event) {
    document.body.classList.add('gamepad-connected');
  }

  /**
   * gamepad was disconnected
   */
  padDisconnected(event) {
    if (this.getGamepads().length === 0) {
      document.body.classList.remove('gamepad-connected');
    }
  }

  /**
   * main loop
   */
  run() {
    this.getGamepads().forEach(pad => {
      // check gamepad buttons
      pad.buttons.forEach((button, index) => {
        const name = BUTTON_NAMES[index];
        const events = this.events[this.layer][name];

        // button is pressed
        if (button.pressed && !this.pressed.has(name)) {
          this.pressed.add(name);

          console.log(`PRESSED ${name}`);

          if (events.length > 0) {
          }
        }
        // button was released
        else if (!button.pressed && this.pressed.has(name)) {
          this.pressed.delete(name);

          console.log(`RELEASED ${name}`);

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
}