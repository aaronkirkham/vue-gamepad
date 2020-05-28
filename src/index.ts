import { App, DirectiveBinding, VNode } from 'vue';
import { DefaultOptions } from './options';
import VueGamepadFactory, { ValidBindingResult } from './gamepad';

function bindErrStr(result: ValidBindingResult) {
  switch (result) {
    case ValidBindingResult.E_INVALID_ARG: return 'missing directive argument (v-gamepad:button)';
    case ValidBindingResult.E_INVALID_CALLBACK: return 'missing directive callback (v-gamepad:button="callback")';
  }

  return '';
}

export default {
  install(app: App, options: object = {}) {
    // we need basic gamepad api support to work
    if (!('getGamepads' in navigator)) {
      return console.error('vue-gamepad: your browser does not support the Gamepad API!');
    }

    const VueGamepad = VueGamepadFactory({ ...DefaultOptions, ...options });
    const gamepad = new VueGamepad();

    app.config.globalProperties.$gamepad = gamepad;

    // v-gamepad directive
    app.directive('gamepad', {
      beforeMount(el: any, binding: DirectiveBinding, vnode: VNode) {
        const result = gamepad.validBinding(binding, vnode);
        if (result !== ValidBindingResult.E_OK) {
          console.error(`vue-gamepad: '${binding.arg}' was not bound. (${bindErrStr(result)})`);
          return console.log(el);
        }

        // if binding doesn't contain any callback, use the onClick callback
        const callback = typeof binding.value !== 'undefined' ? binding.value : vnode?.props?.onClick;
        gamepad.addListener(binding.arg as string, binding.modifiers, callback, vnode);
      },
      beforeUnmount(el: any, binding: DirectiveBinding, vnode: VNode) {
        if (gamepad.validBinding(binding, vnode) !== ValidBindingResult.E_OK) {
          return;
        }

        const callback = typeof binding.value !== 'undefined' ? binding.value : vnode?.props?.onClick;
        gamepad.removeListener(binding.arg as string, binding.modifiers, callback, vnode);
      },
    });

    // v-gamepad-layer directive
    app.directive('gamepad-layer', {
      beforeMount(el: any, binding: DirectiveBinding, vnode: VNode) {
        if (typeof binding.value === 'undefined') {
          console.error(`vue-gamepad: Failed to create layer. (invalid layer value)`);
          return console.log(el);
        }

        gamepad.createLayer(binding.value, vnode);
      },
      // we use unmounted instead of beforeUnmount so that all other directives have a chance to
      // cleanup before the layer is destroyed.
      unmounted(el: any, binding: DirectiveBinding) {
        if (typeof binding.value === 'undefined') {
          return;
        }

        gamepad.destroyLayer(binding.value);
      },
    });
  },
}