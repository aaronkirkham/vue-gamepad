import GamepadFactory from './gamepad';
import DefaultButtonMapping from './default-button-mapping';

export default {
  /**
   * install function
   * @param {Vue} Vue 
   * @param {object} options 
   */
  install(Vue, options = {}) {
    const DefaultOptions = {
      buttonNames: DefaultButtonMapping,
      injectClasses: true,
      silent: true,
    };

    const Gamepad = GamepadFactory(Vue, { ...DefaultOptions, ...options });
    const gamepad = new Gamepad();

    Vue.prototype.$gamepad = gamepad;

    Vue.directive('gamepad', {
      bind: (el, binding, vnode) => {
        if (gamepad.isValidBinding(binding)) {
          const action = binding.modifiers.pressed ? 'pressed' : 'released';
          const event = binding.arg;
          let callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;

          gamepad.addListener(action, event, callback, vnode);
        }
        else {
          console.error(`vue-gamepad: invalid binding. '${binding.arg}' was not bound.`);
        }
      },
      unbind: (el, binding, vnode) => {
        if (gamepad.isValidBinding(binding)) {
          const callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
          gamepad.removeListener(binding.arg, callback);
        }
        else {
          console.error(`vue-gamepad: invalid binding. '${binding.arg}' was not unbound.`);
        }
      },
    });

    // Vue.directive('gamepad-data', {
    //   bind: (el, binding, vnode) => {
    //     console.log(`v-gamepad-data bind`);
    //   },
    //   unbind: (el, binding) => {
    //     console.log(`v-gamepad-data unbind`);
    //   },
    // });

    Vue.directive('gamepad-layer', {
      bind: (el, binding, vnode) => {
        gamepad.switchToLayer(binding.value);
      },
      unbind: (el, binding) => {
        gamepad.removeLayer(binding.value);
      },
    });
  }
}