import { App, DirectiveBinding, VNode } from 'vue';
import { ButtonNames } from './button-mapping';
import VueGamepadFactory, { ValidBindingResult } from './gamepad';

const DEFAULT_OPTIONS: VueGamepadOptions = {
  // Threshold before analog events are triggered. Low values may cause false positives
  analogThreshold: 0.5,

  // List of strings containing button indices
  buttonNames: ButtonNames,

  // Time (in milliseconds) until the button will start repeating when held down
  buttonInitialTimeout: 200,

  // Time (in milliseconds) between each button repeat event when held down
  buttonRepeatTimeout: 200,

  // Add classes to elements which have a gamepad binding
  injectClasses: true,
};

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

    const VueGamepad = VueGamepadFactory(app, { ...DEFAULT_OPTIONS, ...options });
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
        gamepad.createLayer(binding.value, vnode);
      },
      // we use unmounted instead of beforeUnmount so that all other directives have a chance to
      // cleanup before the layer is destroyed.
      unmounted(el: any, binding: DirectiveBinding) {
        gamepad.destroyLayer(binding.value);
      },
    });
  },
}