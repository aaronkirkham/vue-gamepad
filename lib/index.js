import GamepadFactory from './gamepad';
import { ButtonNames } from './button-mapping';

export default {
  /**
   * install function
   * @param {Vue} Vue 
   * @param {object} options 
   */
  install(Vue, options = {}) {
    // we need basic gamepad api support to work
    if (!('getGamepads' in navigator)) {
      console.error(`vue-gamepad: your browser does not support the Gamepad API!`);
      console.error(`vue-gamepad: see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API#Browser_compatibility`);
      return false;
    }

    const DefaultOptions = {
      analogThreshold: 0.5,
      buttonNames: ButtonNames,
      buttonRepeatTimeout: 200,
      injectClasses: true,
      silent: true,
    };

    const Gamepad = GamepadFactory(Vue, { ...DefaultOptions, ...options });
    const gamepad = new Gamepad();

    Vue.prototype.$gamepad = gamepad;

    Vue.directive('gamepad', {
      bind: (el, binding, vnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
          gamepad.addListener(binding.arg, binding.modifiers, callback, vnode);
        }
        else {
          gamepad.error(`invalid binding. '${binding.arg}' was not bound.`);
        }
      },
      unbind: (el, binding, vnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
          gamepad.removeListener(binding.arg, binding.modifiers, callback);
        }
        else {
          gamepad.error(`invalid binding. '${binding.arg}' was not unbound.`);
        }
      },
    });

    Vue.directive('gamepad-layer', {
      bind: (el, binding, vnode) => gamepad.switchToLayer(binding.value),
      unbind: (el, binding) => gamepad.removeLayer(binding.value),
    });
  }
}