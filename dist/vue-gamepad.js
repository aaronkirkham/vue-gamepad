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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  /**
   * helper function to build all properties like lodash's _.set function
   * 
   * set(object, ['x', 'y', 'z'], 'default')
   * console.log(object.x.y.z);
   *  => default
   * 
   * @param {object} obj object to build properties for
   * @param {array} keys list of keys to nest
   * @param {any} value value to set
   */
  function set$1(obj, keys, value) {
    obj[keys[0]] = obj[keys[0]] || {};
    var tmp = obj[keys[0]];

    if (keys.length > 1) {
      keys.shift();
      set$1(tmp, keys, value);
    } else {
      obj[keys[0]] = value;
    }

    return obj;
  }
  /**
   * helper function to get value from a nest object like lodash's ._get function
   * 
   * get({ x: { y: 0 } }, ['x', 'y', 'z'], undefined)
   * => undefined
   * 
   * @param {object} obj object to get properties from
   * @param {array} keys list of keys to use
   * @param {any} (optional) def default value if nothing was found
   */

  function get(obj, keys) {
    var def = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    var tmp = obj[keys[0]];

    if (keys.length > 1 && tmp) {
      keys.shift();
      return get(tmp, keys) || def;
    }

    return tmp || def;
  }

  function GamepadFactory (Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return (
      /*#__PURE__*/
      function () {
        function Gamepad() {
          _classCallCheck(this, Gamepad);

          this.pressed = new Set();
          this.events = {};
          this.layer = 0;
          this.layers = {};
          this.holding = {};
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
            var vnode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            console.log("listening for '".concat(action, "' '").concat(event, "' on layer ").concat(this.layer, "...")); // register the event

            set$1(this.events, [this.layer, action, event], []);
            this.events[this.layer][action][event].push({
              vnode: vnode,
              callback: callback
            });
          }
          /**
           * remove an event handler
           * @param {string} action type of action on the button (pressed, released)
           * @param {string} event name of the button event
           * @param {function} callback trigger function
           */

        }, {
          key: "removeListener",
          value: function removeListener(action, event, callback) {
            console.log("removing listener for '".concat(event, "' on layer ").concat(this.layer, "..."));
            var events = get(this.events, [this.layer, action], []);

            if (events.length > 0) {
              events[event] = events[event].filter(function (e) {
                return e.callback !== callback;
              });
            }
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
            var _this = this;

            this.getGamepads().forEach(function (pad) {
              // check gamepad buttons
              pad.buttons.forEach(function (button, index) {
                var name = options.buttonNames[index]; // button is pressed

                if (button.pressed) {
                  var now = Date.now();
                  var events = get(_this.events, [_this.layer, 'pressed', name], []);

                  if (!_this.pressed.has(name)) {
                    _this.pressed.add(name);

                    _this.holding[name] = now;

                    if (events.length > 0) {
                      var event = events[events.length - 1];
                      event.callback.call();
                    }
                  } // button is being held
                  else if (now - _this.holding[name] >= options.buttonRepeatTimeout) {
                      _this.holding[name] = now;

                      if (events.length > 0) {
                        var _event = events[events.length - 1];

                        _event.callback.call();
                      }
                    }
                } // button was released
                else if (!button.pressed && _this.pressed.has(name)) {
                    _this.pressed.delete(name);

                    delete _this.holding[name];

                    var _events = get(_this.events, [_this.layer, 'released', name], []);

                    if (_events.length > 0) {
                      var _event2 = _events[_events.length - 1];

                      _event2.callback.call();
                    }
                  }
              }); // check gamepad axis

              pad.axes.forEach(function (axis, index) {});
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
          /**
           * helper function to test if a binding is valid
           * @param {object} binding binding to test which includes arg & value
           */

        }, {
          key: "isValidBinding",
          value: function isValidBinding(binding) {
            return typeof binding.arg !== 'undefined' && options.buttonNames.includes(binding.arg) && (typeof binding.value === 'function' || typeof binding.value === 'undefined' && typeof binding.expression === 'undefined');
          }
        }]);

        return Gamepad;
      }()
    );
  }

  var DefaultButtonMapping = ['button-a', 'button-b', 'button-x', 'button-y', 'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right', 'button-select', 'button-start', 'left-stick-in', 'right-stick-in', 'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right', 'vendor'];

  var index = {
    /**
     * install function
     * @param {Vue} Vue 
     * @param {object} options 
     */
    install: function install(Vue) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var DefaultOptions = {
        buttonNames: DefaultButtonMapping,
        buttonRepeatTimeout: 250,
        injectClasses: true,
        silent: true
      };
      var Gamepad = GamepadFactory(Vue, _objectSpread({}, DefaultOptions, options));
      var gamepad = new Gamepad();
      Vue.prototype.$gamepad = gamepad;
      Vue.directive('gamepad', {
        bind: function bind(el, binding, vnode) {
          if (gamepad.isValidBinding(binding)) {
            console.log(binding.modifiers);
            var action = binding.modifiers.released ? 'released' : 'pressed';
            var event = binding.arg;
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.addListener(action, event, callback, vnode);
          } else {
            console.error("vue-gamepad: invalid binding. '".concat(binding.arg, "' was not bound."));
          }
        },
        unbind: function unbind(el, binding, vnode) {
          if (gamepad.isValidBinding(binding)) {
            var action = binding.modifiers.released ? 'released' : 'pressed';
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.removeListener(action, binding.arg, callback);
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
