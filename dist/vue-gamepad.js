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
   * helper function to build all nested properties similar to lodash's _.set function
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
   * helper function to get value from a nest object similar to lodash's ._get function
   * 
   * get({ x: { y: 0 } }, ['x', 'y', 'z'], [])
   * => []
   * 
   * @param {object} obj object to get properties from
   * @param {array} keys list of keys to use
   * @param {any} [def=undefined] default value if nothing was found
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

  var ButtonNames = ['button-a', 'button-b', 'button-x', 'button-y', 'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right', 'button-select', 'button-start', 'left-stick-in', 'right-stick-in', 'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right', 'vendor'];
  /**
   * get name of axis from input value
   * @param {number} axis axis id
   * @param {number} value current input value
   * @param {number} [threshold=1] dead zone of the analog
   */

  function getAxisName(axis, value) {
    var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    if (value >= threshold) {
      if (axis === 0) return 'left-analog-right';else if (axis === 1) return 'left-analog-down';else if (axis === 2) return 'right-analog-right';else if (axis === 3) return 'right-analog-down';
    } else if (value <= -threshold) {
      if (axis === 0) return 'left-analog-left';else if (axis === 1) return 'left-analog-up';else if (axis === 2) return 'right-analog-left';else if (axis === 3) return 'right-analog-up';
    }

    return undefined;
  }

  function GamepadFactory (Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return (
      /*#__PURE__*/
      function () {
        function Gamepad() {
          _classCallCheck(this, Gamepad);

          this.holding = {};
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
           * @param {string} event name of the button event
           * @param {object} modifiers vue binding modifiers
           * @param {function} callback function to trigger
           * @param {object} vnode vue directive vnode
           */

        }, {
          key: "addListener",
          value: function addListener(event, modifiers, callback) {
            var vnode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var action = modifiers.released ? 'released' : 'pressed';
            var repeat = !!modifiers.repeat;
            this.debug("listening for '".concat(event, "' '").concat(action, "' (repeat? ").concat(repeat, ") on layer ").concat(this.layer, "...")); // if we don't already have an array initialised for the current event
            // do it now

            var events = get(this.events, [this.layer, action, event], []);

            if (events.length === 0) {
              set$1(this.events, [this.layer, action, event], []);
            } // register the event


            this.events[this.layer][action][event].push({
              vnode: vnode,
              repeat: repeat,
              callback: callback
            }); // inject classes

            if (options.injectClasses && vnode && vnode.elm) {
              vnode.elm.classList.add('v-gamepad', "v-gamepad--".concat(event));
            }
          }
          /**
           * remove an event handler
           * @param {string} event name of the button event
           * @param {object} modifiers vue binding modifiers
           * @param {function} callback trigger function
           */

        }, {
          key: "removeListener",
          value: function removeListener(event, modifiers, callback) {
            var action = modifiers.released ? 'released' : 'pressed';
            this.debug("removing listener for '".concat(event, "' '").concat(action, "' on layer ").concat(this.layer, "...")); // get a list of all events for the current action

            var events = get(this.events, [this.layer, action, event], []);

            if (events.length > 0) {
              // filter any events which have same callback
              events = events.filter(function (event) {
                return event.callback !== callback;
              }); // if we have any remaining events after the filter, update the array
              // otherwise delete the object

              if (events.length > 0) {
                set$1(this.events, [this.layer, action, event], events);
              } else {
                delete this.events[this.layer][action][event];
              }
            }
          }
          /**
           * switch to a new layer
           * @param {number} layer layer number to switch to
           */

        }, {
          key: "switchToLayer",
          value: function switchToLayer(layer) {
            if (this.layer != layer) {
              // keep track of the old layer before we switch
              this.layers[layer] = this.layer;
              this.layer = layer;
              this.debug("switched to layer ".concat(this.layer, "."));
            }
          }
          /**
           * remove a layer, delete the registered events and switch back to the old layer
           * @param {number} layer layer number to remove
           */

        }, {
          key: "removeLayer",
          value: function removeLayer(layer) {
            // switch back to the previous layer
            this.layer = this.layers[layer];
            delete this.layers[layer]; // delete the layer events

            delete this.events[layer];
            this.debug("switched back to layer ".concat(this.layer, "."));
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

                  if (events.length > 0) {
                    var event = events[events.length - 1]; // button was just pressed, or is repeating

                    if (typeof _this.holding[name] === 'undefined' || event.repeat && now - _this.holding[name] >= options.buttonRepeatTimeout) {
                      _this.holding[name] = now;
                      event.callback.call();
                    }
                  }
                } // button was released
                else if (!button.pressed && typeof _this.holding[name] !== 'undefined') {
                    delete _this.holding[name];

                    var _events = get(_this.events, [_this.layer, 'released', name], []);

                    if (_events.length > 0) {
                      var _event = _events[_events.length - 1];

                      _event.callback.call();
                    }
                  }
              }); // check gamepad axis

              pad.axes.forEach(function (value, index) {
                if (value >= options.analogThreshold || value <= -options.analogThreshold) {
                  var name = getAxisName(index, value, options.analogThreshold);
                  var events = get(_this.events, [_this.layer, 'pressed', name], []);

                  if (events.length > 0) {
                    var event = events[events.length - 1];
                    var now = Date.now(); // axis was just moved, or is repeating

                    if (typeof _this.holding[name] === 'undefined' || event.repeat && now - _this.holding[name] >= options.buttonRepeatTimeout) {
                      _this.holding[name] = now;
                      event.callback.call();
                    }
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
          /**
           * helper function to test if a binding is valid
           * @param {object} binding binding to test which includes arg & value
           * @return {boolean}
           */

        }, {
          key: "isValidBinding",
          value: function isValidBinding(binding) {
            return typeof binding.arg !== 'undefined' && (typeof binding.value === 'function' || typeof binding.value === 'undefined' && typeof binding.expression === 'undefined');
          }
        }, {
          key: "debug",
          value: function debug() {
            if (!options.silent) {
              var _console;

              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              (_console = console).log.apply(_console, ['%cvue-gamepad', 'background:#fc0;color:#000'].concat(args));
            }
          }
        }, {
          key: "error",
          value: function error() {
            var _console2;

            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            (_console2 = console).error.apply(_console2, ['%cvue-gamepad', 'background:#fc0;color:#000'].concat(args));
          }
        }]);

        return Gamepad;
      }()
    );
  }

  var index = {
    /**
     * install function
     * @param {Vue} Vue 
     * @param {object} options 
     */
    install: function install(Vue) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // we need basic gamepad api support to work
      if (!('getGamepads' in navigator)) {
        console.error("vue-gamepad: your browser does not support the Gamepad API!");
        console.error("vue-gamepad: see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API#Browser_compatibility");
        return false;
      }

      var DefaultOptions = {
        analogThreshold: 0.5,
        buttonNames: ButtonNames,
        buttonRepeatTimeout: 200,
        injectClasses: true,
        silent: true
      };
      var Gamepad = GamepadFactory(Vue, _objectSpread({}, DefaultOptions, options));
      var gamepad = new Gamepad();
      Vue.prototype.$gamepad = gamepad;
      Vue.directive('gamepad', {
        bind: function bind(el, binding, vnode) {
          if (gamepad.isValidBinding(binding)) {
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.addListener(binding.arg, binding.modifiers, callback, vnode);
          } else {
            gamepad.error("invalid binding. '".concat(binding.arg, "' was not bound."));
          }
        },
        unbind: function unbind(el, binding, vnode) {
          if (gamepad.isValidBinding(binding)) {
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.removeListener(binding.arg, binding.modifiers, callback);
          } else {
            gamepad.error("invalid binding. '".concat(binding.arg, "' was not unbound."));
          }
        }
      });
      Vue.directive('gamepad-layer', {
        bind: function bind(el, binding, vnode) {
          return gamepad.switchToLayer(binding.value);
        },
        unbind: function unbind(el, binding) {
          return gamepad.removeLayer(binding.value);
        }
      });
    }
  };

  return index;

})));
