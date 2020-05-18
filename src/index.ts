import { App, DirectiveBinding, VNode } from 'vue';
import { ButtonNames } from './button-mapping';
import GamepadFactory from './gamepad';

const DEFAULT_OPTIONS: VueGamepadOptions = {
  // Threshold before analog events are triggered. Low values may cause false positives
  analogThreshold: 0.5,

  // List of strings containing button indices
  buttonNames: ButtonNames,

  // Time (in milliseconds) until the button will start repeating when held down
  buttonRepeatTimeout: 200,

  // Time (in milliseconds) between each button repeat event when held down
  buttonInitialTimeout: 200,

  // Add classes to elements which have a gamepad binding
  injectClasses: true,
};

export default {
  install(app: App, options: object = {}) {
    // we need basic gamepad api support to work
    if (!('getGamepads' in navigator)) {
      return console.error('vue-gamepad: your browser does not support the Gamepad API!');
    }

    const VueGamepad = GamepadFactory(app, { ...DEFAULT_OPTIONS, ...options });
    const gamepad = new VueGamepad();

    app.config.globalProperties.$gamepad = gamepad;

    app.directive('gamepad', {
      beforeMount(el: any, binding: DirectiveBinding, vnode: VNode) {
        if (!gamepad.validBinding(binding)) {
          return console.error(`vue-gamepad: invalid binding. '${binding.arg}' was not bound.`);
        }

        // if binding doesn't contain any callback, use the onClick callback
        const callback = typeof binding.value !== 'undefined' ? binding.value : vnode?.props?.onClick;
        gamepad.addListener(<string>binding.arg, binding.modifiers, callback, vnode);
      },
      beforeUnmount(el: any, binding: DirectiveBinding, vnode: VNode) {
        if (!gamepad.validBinding(binding)) {
          return;
        }

        const callback = typeof binding.value !== 'undefined' ? binding.value : vnode?.props?.onClick;
        gamepad.removeListener(<string>binding.arg, binding.modifiers, callback);
      },
    });
  },
}