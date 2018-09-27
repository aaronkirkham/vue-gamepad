import { Gamepad, BUTTON_NAMES } from './gamepad';

export default {
  /**
   * install function
   * @param {Vue} Vue 
   * @param {object} options 
   */
  install(Vue, options = {}) {
    const gamepad = new Gamepad(Vue, options);
    console.log(gamepad);

    Vue.prototype.$gamepad = gamepad;

    //Vue.prototype.$gamepad = {
    //   forceLayer: (layer) => {
    //     if (gamepad.layer !== layer) {
    //       gamepad.layers[layer] = gamepad.layer;
    //       gamepad.layer = layer;

    //       console.log(`forcing new gamepad layer. prev: ${gamepad.layers[layer]}, new: ${layer}`);
    //     }
    //   },
    //};

    Vue.directive('gamepad', {
      bind: (el, binding, vnode) => {
        if (binding.arg && BUTTON_NAMES.includes(binding.arg)) {

          // TODO: modifiers -> .pressed, .released, no modifier = default to released
          // TODO: no value => use @click handler (vnode.data.on.click)

          const action = binding.modifiers.pressed ? 'pressed' : 'released';
          const event = binding.arg;
          let callback = binding.value;

          console.log(`BIND:`, action, event);

          // if we didn't pass a value, use the click handler
          if (typeof binding.value === 'undefined') {
            console.log(`no callback present. using @click handler...`);
            callback = vnode.data.on.click;
          }

          gamepad.addListener(action, event, callback, vnode);
          console.log(``);
        }
        else {
          console.error(`BIND: invalid v-gamepad binding`);
        }
      },
      unbind: (el, binding) => {
        if (binding.arg && BUTTON_NAMES.includes(binding.arg)) {
          gamepad.removeListener(binding.arg, binding.value);
        }
        else {
          console.error(`UNBIND: invalid v-gamepad binding`);
        }
      },
    });

    Vue.directive('gamepad-data', {
      bind: (el, binding, vnode) => {
        console.log(`v-gamepad-data`);
      },
      unbind: (el, binding) => {
      },
    });

    Vue.directive('gamepad-layer', {
      bind: (el, binding, vnode) => {
        console.log(`v-gamepad-layer`);
      },
      unbind: (el, binding) => {
      },
    });
  }
}