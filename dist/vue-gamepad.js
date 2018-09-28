(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueGamepad = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var BUTTON_NAMES = ['button-a', 'button-b', 'button-x', 'button-y', 'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right', 'button-select', 'button-start', 'left-stick-in', 'right-stick-in', 'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right', 'vendor'];
  var Gamepad =
  /*#__PURE__*/
  function () {
    function Gamepad(Vue, options) {
      _classCallCheck(this, Gamepad);

      this.pressed = new Set();
      this.events = {};
      this.layer = 0;
      this.layers = {};
      window.addEventListener('gamepadconnected', this.padConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.padDisconnected.bind(this));
      this.animationFrame = requestAnimationFrame(this.run.bind(this));
    }
    /**
     * gamepad was connected
     * @param {GamepadEvent} event 
     */


    _createClass(Gamepad, [{
      key: "padConnected",
      value: function padConnected(event) {
        document.body.classList.add('gamepad-connected');
      }
      /**
       * gamepad was disconnected
       * @param {GamepadEvent} event 
       */

    }, {
      key: "padDisconnected",
      value: function padDisconnected(event) {
        if (this.getGamepads().length === 0) {
          document.body.classList.remove('gamepad-connected');
        }
      }
      /**
       * add an event handler
       * @param {string} action type of action on the button (pressed, released)
       * @param {string} event name of the button event
       * @param {function} callback function to trigger
       * @param {object} vnode vue directive vnode
       */

    }, {
      key: "addListener",
      value: function addListener(action, event, callback) {
        var _this = this;

        var vnode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        console.log("listening for '".concat(event, "' on layer ").concat(this.layer, "...")); // TODO: handle action
        // setup the current layer if needed

        if (typeof this.events[this.layer] === 'undefined') {
          this.events[this.layer] = {};
          BUTTON_NAMES.forEach(function (b) {
            return _this.events[_this.layer][b] = [];
          });
        } // register the event


        this.events[this.layer][event].push({
          vnode: vnode,
          callback: callback
        });
        console.log(this.events[this.layer][event]);
      }
      /**
       * remove an event handler
       * @param {string} event name of the button event
       * @param {function} callback trigger function
       */

    }, {
      key: "removeListener",
      value: function removeListener(event, callback) {
        console.log("removing listener for '".concat(event, "' on layer ").concat(this.layer, "..."));
        var events = this.events[this.layer];
        events[event] = events[event].filter(function (e) {
          return e.callback !== callback;
        });
      }
      /**
       * switch to a new layer
       * @param {*} layer 
       */

    }, {
      key: "switchToLayer",
      value: function switchToLayer(layer) {
        if (this.layer != layer) {
          // keep track of the old layer before we switch
          this.layers[layer] = this.layer;
          this.layer = layer;
          console.log("switched to layer ".concat(this.layer, "."));
        }
      }
      /**
       * remove a layer, delete the registered events and switch back to the old layer
       * @param {*} layer 
       */

    }, {
      key: "removeLayer",
      value: function removeLayer(layer) {
        // switch back to the previous layer
        this.layer = this.layers[layer];
        delete this.layers[layer]; // delete the layer events

        delete this.events[layer];
        console.log("switched back to layer ".concat(this.layer, "."));
      }
      /**
       * main loop
       */

    }, {
      key: "run",
      value: function run() {
        var _this2 = this;

        this.getGamepads().forEach(function (pad) {
          // check gamepad buttons
          pad.buttons.forEach(function (button, index) {
            var name = BUTTON_NAMES[index];
            var events = _this2.events[_this2.layer][name]; // button is pressed

            if (button.pressed && !_this2.pressed.has(name)) {
              _this2.pressed.add(name);

              if (events.length > 0) ;
            } // button was released
            else if (!button.pressed && _this2.pressed.has(name)) {
                _this2.pressed.delete(name);

                if (events.length > 0) {
                  var event = events[events.length - 1];
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

    }, {
      key: "getGamepads",
      value: function getGamepads() {
        return Array.from(navigator.getGamepads()).filter(function (pad) {
          return pad !== null;
        });
      }
    }]);

    return Gamepad;
  }();

  var isValidBinding = function isValidBinding(binding) {
    return binding.arg && BUTTON_NAMES.includes(binding.arg) && (typeof binding.value === 'function' || typeof binding.value === 'undefined' && typeof binding.expression === 'undefined');
  };

  var index = {
    /**
     * install function
     * @param {Vue} Vue 
     * @param {object} options 
     */
    install: function install(Vue) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var gamepad = new Gamepad(Vue, options);
      console.log(gamepad); // options.buttonMapping
      // options.injectClasses
      // options.silent

      Vue.prototype.$gamepad = gamepad;
      Vue.directive('gamepad', {
        bind: function bind(el, binding, vnode) {
          if (isValidBinding(binding)) {
            var action = binding.modifiers.pressed ? 'pressed' : 'released';
            var event = binding.arg;
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.addListener(action, event, callback, vnode);
          } else {
            console.error("vue-gamepad: invalid binding. '".concat(binding.arg, "' was not bound."));
          }
        },
        unbind: function unbind(el, binding, vnode) {
          if (isValidBinding(binding)) {
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.removeListener(binding.arg, callback);
          } else {
            console.error("vue-gamepad: invalid binding. '".concat(binding.arg, "' was not unbound."));
          }
        }
      }); // Vue.directive('gamepad-data', {
      //   bind: (el, binding, vnode) => {
      //     console.log(`v-gamepad-data bind`);
      //   },
      //   unbind: (el, binding) => {
      //     console.log(`v-gamepad-data unbind`);
      //   },
      // });

      Vue.directive('gamepad-layer', {
        bind: function bind(el, binding, vnode) {
          gamepad.switchToLayer(binding.value);
        },
        unbind: function unbind(el, binding) {
          gamepad.removeLayer(binding.value);
        }
      });
    }
  };

  return index;

})));
